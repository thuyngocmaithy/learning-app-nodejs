import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
// import authRouter from './routes/authRoutes';
import { authMiddleware } from './middlewares/auth.middleware';
import { response } from './utils/responseHelper';
import { connectDB } from './config/connectDB'; // Import kết nối TypeORM

import http from 'http';
import { Server } from 'socket.io';
import { setupSockets } from './socket';


import path from 'path';
import authRoutes from './routes/auth.route';
import majorRoute from './routes/major.route';
import notificationRoute from './routes/notification.route';
import userRoutes from './routes/User.route';
import accountRoutes from './routes/account.route';
import attachRoutes from './routes/attach.route';
import componentScoreRoutes from './routes/componentScore.route';
import facultyRoutes from './routes/faculty.route';
import followerRoutes from './routes/follower.route';
import followerDetailRoutes from './routes/followerDetail.route';
import thesisUserRoutes from './routes/thesis_user.route';
import thesisRoute from './routes/thesis.route';
import subjectRoute from './routes/subject.route';
import studyFrameRoute from './routes/studyFrame.route';
import statusRoute from './routes/status.route';
import semesterRoute from './routes/semeter.route';
import scoreRoute from './routes/score.route';
import permissionFeatureRouter from './routes/permission_feature.route';
import permissionRoute from './routes/permission.route';
import scientificResearchUserRoute from './routes/scientificResearch_user.route';
import scientificResearchRoute from './routes/scientificResearch.route';
import conversationRouter from './routes/conversation.route';
import messageRouter from './routes/message.route';
import participantRouter from './routes/participant.route';
import featureRouter from './routes/feature.route';
import fs from 'fs/promises';
import sguAuthRouter from './routes/sguAuth.route';
import scientificResearchGroupRoute from './routes/scientificResearchGroup.route';
import userRegisterSubjectRouter from './routes/userRegisterSubject.route';
import megaRoutes from './routes/mega.route';
import cycleRoutes from './routes/cycle.route';
import studyFrameComponentRoutes from './routes/studyFrame_component.route';
import frameStructureRoutes from './routes/frameStucture.route';
import subject_studyFrameCompRoutes from './routes/subject_studyFrameComp.route';
import studyFrame_faculty_cycle from './routes/studyFrame_faculty_cycle.route';


// Nạp các biến môi trường từ file .env
dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    path: '/socket.io',
    cors: {
        origin: 'https://learning-app-ashy.vercel.app', // Allow frontend origin,
        methods: ["GET", "POST"]
    }
});

// Thiết lập các sự kiện socket
setupSockets(io);


app.use(cors({
    origin: 'https://learning-app-ashy.vercel.app', // Allow frontend origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;


// Kết nối cơ sở dữ liệu với TypeORM
connectDB().then(() => {
    // Chỉ khởi động server sau khi kết nối cơ sở dữ liệu thành công
    server.listen(PORT, () => {
        console.log(`Server đang chạy trên cổng ${PORT}`);
    });
}).catch((error) => {
    console.error('Không thể kết nối cơ sở dữ liệu:', error);
});

app.use(express.static(getPublicDir()));


// Tạo thư mục uploads nếu chưa tồn tại
// const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

// async function createUploadDir() {
//     try {
//         await fs.mkdir(uploadDir, { recursive: true });
//     } catch (error) {
//         console.error('Error creating upload directory:', error);
//     }
// }

// createUploadDir();

// Route được bảo vệ để kiểm tra xác thực
app.get('/api/protected', authMiddleware, async (req, res) => {
    await response(res, 200, 'success', { account: req.account }, 'Xác thực thành công!');
});

// Route chính
app.get('/', (req, res) => {
    res.send('Chào mừng đến với API của chúng tôi!');
});

// Sử dụng router auth
app.use('/api/authSGU', sguAuthRouter);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/attachments', attachRoutes);
app.use('/api/component-scores', componentScoreRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/followers', followerRoutes);
app.use('/api/follower-details', followerDetailRoutes);
app.use('/api/majors', majorRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/permission-features', permissionFeatureRouter);
app.use('/api/permissions', permissionRoute);
app.use('/api/scientificResearch-user', scientificResearchUserRoute);
app.use('/api/scientificResearchs', scientificResearchRoute);
app.use('/api/scientificResearchGroups', scientificResearchGroupRoute);
app.use('/api/scores', scoreRoute);
app.use('/api/semesters', semesterRoute);
app.use('/api/statuses', statusRoute);
app.use('/api/study-frames', studyFrameRoute);
app.use('/api/study-frame-components', studyFrameComponentRoutes);
app.use('/api/subjects', subjectRoute);
app.use('/api/thesis-user', thesisUserRoutes);
app.use('/api/thesis', thesisRoute);
app.use('/api/conversations', conversationRouter);
app.use('/api/messages', messageRouter);
app.use('/api/participants', participantRouter);
app.use('/api/features', featureRouter);
app.use('/api/user-register-subject', userRegisterSubjectRouter);
app.use('/api/mega', megaRoutes);
app.use('/api/cycles', cycleRoutes);
app.use('/api/frameStructures', frameStructureRoutes);
app.use('/api/subject_studyFrameComps', subject_studyFrameCompRoutes);
app.use('/api/studyFrame_faculty_cycles', studyFrame_faculty_cycle);



export default app;

function getPublicDir() {
    return process.env.PUBLIC_DIR || path.resolve(__dirname, "..", "public");
}
