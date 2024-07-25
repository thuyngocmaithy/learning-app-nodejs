// src/models/account.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/connectDB';

interface AccountAttributes {
  id: number;
  email: string;
  password: string;
  mssv: string;
}

interface AccountCreationAttributes extends Optional<AccountAttributes, 'id'> { }

class Account extends Model<AccountAttributes, AccountCreationAttributes> implements AccountAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public mssv!: string;
}

Account.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mssv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'account',
    timestamps: false,
  }
);

export default Account;
