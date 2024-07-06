import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    type: string;
    content: string;
    recipient: string;
    createdAt: Date;
    read: boolean;
}

const notificationSchema: Schema<INotification> = new Schema<INotification>({
    type: { type: String, required: true },
    content: { type: String, required: true },
    recipient: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
