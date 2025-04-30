import { DataTypes } from "sequelize";
import sequlize from "../../../postgres.service.js";


const block_replacement_model = sequlize.define("block_replacement_details", {
    id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    block_asset_id: {
        type: DataTypes.UUID,
        allowNull: false
    },
    issueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    replacementId: {
        type: DataTypes.STRING,
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    replacementReason: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    initiatedBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    replacementStatus: {
        type: DataTypes.ENUM('INSTALLED', 'RECEIVED', 'IN TRANSIT'),
        defaultValue: "RECEIVED"
    },
    remarks: {
        type: DataTypes.STRING,
        defaultValue: null
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: false
    },
}, {
    tableName: "block_replacement_details", timestamps: true, hooks: {
        beforeCreate: async (instance, options) => {
            const last_record = await block_replacement_model.findOne({ order: [['createdAt', 'DESC']] });
            if (last_record) {
                let [repl, last_no] = last_record?.replacementId?.split("-")
                instance.replacementId = `REPL-${last_no ? parseInt(last_no) + 1 : 1}`
            } else {
                instance.replacementId = `REPL-1`
            }
        }
    }
});

export default block_replacement_model;