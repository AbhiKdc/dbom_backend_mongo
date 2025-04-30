import { DataTypes } from "sequelize";
import sequlize from "../../postgres.service.js";


const gp_details_model = sequlize.define('gp_details', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: DataTypes.UUIDV4
    },
    gp_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // unique: true
    },

    //?
    status: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gp_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gp_code: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    //
    // current_steps: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // },
    //
    // total_steps: {
    //     type: DataTypes.INTEGER,
    //     allowNull: false
    // },

    block_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    district_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    state_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    package_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    type: {
        type: DataTypes.INTEGER, // Block,GP,District
        allowNull: true
    },
    latitude: {
        type: DataTypes.STRING,
        allowNull: true
    },
    longitude: {
        type: DataTypes.STRING,
        allowNull: true
    },

    //?sireen
    manhole_latitude: {
        type: DataTypes.STRING,
        allowNull: true
    },
    manhole_longitude: {
        type: DataTypes.STRING,
        allowNull: true
    },
    gp_image: {
        type: DataTypes.STRING,
        allowNull: true
    },
    //?
    zmanhole_loc_image: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: []
    },
    package: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    district: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    state: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },
    block: {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: {}
    },

    //?
    builder_details: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    //?
    information: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },

    //?
    physical_details: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    //?
    installation_details: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    //?
    otdr_details: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {}
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: null
    },
    deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
    }

}, { tableName: "gp_details", timestamps: true, underscored: true });


export default gp_details_model;