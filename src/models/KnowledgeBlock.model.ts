// src/models/KnowledgeBlock.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/connectDB';

interface KnowledgeBlockAttributes {
  id: number;
  name: string;
}

interface KnowledgeBlockCreationAttributes extends Optional<KnowledgeBlockAttributes, 'id'> { }

class KnowledgeBlock extends Model<KnowledgeBlockAttributes, KnowledgeBlockCreationAttributes> implements KnowledgeBlockAttributes {
  public id!: number;
  public name!: string;
}

KnowledgeBlock.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'knowledge_block',
    timestamps: false,
  }
);

export default KnowledgeBlock;
