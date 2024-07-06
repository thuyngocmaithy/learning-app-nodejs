import mongoose, { Schema, Document } from 'mongoose';

export interface IFeature extends Document {
  id: string;
  feautureId: string;
  menuId: string;
  order: number;
  displayName: string;
  url: string;
  detail_list: any[];
}

const FeatureSchema = new Schema<IFeature>({
  id: { type: String, required: true },
  feautureId: { type: String, required: true },
  menuId: { type: String },
  order: { type: Number, required: true },
  displayName: { type: String, required: true },
  url: { type: String, required: true },
  detail_list: [{ type: Schema.Types.Mixed }]
});

const Feature = mongoose.model<IFeature>('Feature', FeatureSchema);

export default Feature;
export { FeatureSchema };
