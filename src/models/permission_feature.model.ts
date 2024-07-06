//Nhúng

//name
//code

import mongoose, { Schema, Document } from 'mongoose';
import { IFeature, FeatureSchema } from './feature.model'; // Adjust the import path as needed

export interface IPermission extends Document {
  permissionid: string;
  permissionName: string;
  permissionCode: string;
  feauture: IFeature[]; // Embedding IChucNang documents
}

const PermissionSchema: Schema<IPermission> = new Schema<IPermission>({
  permissionid: { type: String, required: true },
  permissionName: { type: String, required: true },
  permissionCode: { type: String, required: true },
  feauture: [FeatureSchema] 
});

const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);

export default Permission;

