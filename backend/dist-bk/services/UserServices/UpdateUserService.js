"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Yup = __importStar(require("yup"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ShowUserService_1 = __importDefault(require("./ShowUserService"));
const Company_1 = __importDefault(require("../../models/Company"));
const User_1 = __importDefault(require("../../models/User"));
const UpdateUserService = async ({ userData, userId, companyId, requestUserId }) => {
    const user = await (0, ShowUserService_1.default)(userId, companyId);
    const requestUser = await User_1.default.findByPk(requestUserId);
    if (requestUser.super === false && userData.companyId !== companyId) {
        throw new AppError_1.default("O usuário não pertence à esta empresa");
    }
    const schema = Yup.object().shape({
        name: Yup.string().min(2),
        allHistoric: Yup.string(),
        email: Yup.string().email(),
        profile: Yup.string(),
        password: Yup.string()
    });
    const oldUserEmail = user.email;
    const { email, password, profile, name, queueIds = [], startWork, endWork, farewellMessage, whatsappId, allTicket, defaultTheme, defaultMenu, allowGroup, allHistoric, allUserChat, userClosePendingTicket, showDashboard, allowConnections, defaultTicketsManagerWidth = 550, allowRealTime, profileImage, wpp } = userData;
    try {
        await schema.validate({ email, password, profile, name });
    }
    catch (err) {
        throw new AppError_1.default(err.message);
    }
    await user.update({
        email,
        password,
        profile,
        name,
        startWork,
        endWork,
        farewellMessage,
        whatsappId: whatsappId || null,
        allTicket,
        defaultTheme,
        defaultMenu,
        allowGroup,
        allHistoric,
        allUserChat,
        userClosePendingTicket,
        showDashboard,
        defaultTicketsManagerWidth,
        allowRealTime,
        profileImage,
        allowConnections,
        wpp
    });
    await user.$set("queues", queueIds);
    await user.reload();
    const company = await Company_1.default.findByPk(user.companyId);
    if (company.email === oldUserEmail) {
        await company.update({
            email,
            password
        });
    }
    const serializedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        companyId: user.companyId,
        company,
        queues: user.queues,
        startWork: user.startWork,
        endWork: user.endWork,
        greetingMessage: user.farewellMessage,
        allTicket: user.allTicket,
        defaultMenu: user.defaultMenu,
        defaultTheme: user.defaultTheme,
        allowGroup: user.allowGroup,
        allHistoric: user.allHistoric,
        userClosePendingTicket: user.userClosePendingTicket,
        showDashboard: user.showDashboard,
        defaultTicketsManagerWidth: user.defaultTicketsManagerWidth,
        allowRealTime: user.allowRealTime,
        allowConnections: user.allowConnections,
        profileImage: user.profileImage,
        wpp: user.wpp
    };
    return serializedUser;
};
exports.default = UpdateUserService;
