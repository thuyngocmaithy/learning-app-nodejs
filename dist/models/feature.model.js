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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const chucNangSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    ma_chuc_nang: { type: String, required: true },
    ma_menu: { type: String },
    thu_tu: { type: Number, required: true },
    ten_hien_thi: { type: String, required: true },
    ten_mobile: {
        nhom: { type: String },
        ten_eng: { type: String }
    },
    ten_hien_thi_Eg: { type: String, required: true },
    ten_tooltip: { type: String, required: true },
    url: { type: String, required: true },
    url_danh_muc_hoc_lieu: { type: String },
    ds_chi_tiet: [{ type: mongoose_1.Schema.Types.Mixed }]
});
const ChucNang = mongoose_1.default.model('ChucNang', chucNangSchema);
exports.default = ChucNang;
