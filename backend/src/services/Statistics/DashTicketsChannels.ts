import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  companyId: string | number;
  userId: string | number;
  userProfile: string;
}

const queryAdmin = `
  select label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  t.channel as label,
  count(1) as qtd
  from "Tickets" t
  where t."companyId" = :companyId
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by t.channel
  ) a
  order by 2 Desc
`;

const query = `
  select label, qtd, ROUND(100.0*(qtd/sum(qtd) over ()), 2) pertentual  from (
  select
  t.channel as label,
  count(1) as qtd
  from "Tickets" t
  where t."companyId" = :companyId AND t."userId" = :userId
  and date_trunc('day', t."createdAt") between :startDate and :endDate
  group by t.channel
  ) a
  order by 2 Desc
`;

const DashTicketsChannels = async ({
  startDate,
  endDate,
  companyId,
  userId,
  userProfile
}: Request): Promise<any[]> => {
  const data = await sequelize.query(
    userProfile == "admin" ? queryAdmin : query,
    {
      replacements: {
        companyId,
        startDate,
        endDate,
        userId
      },
      type: QueryTypes.SELECT
      // logging: console.log
    }
  );
  return data;
};

export default DashTicketsChannels;
