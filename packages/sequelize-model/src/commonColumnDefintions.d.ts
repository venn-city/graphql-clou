export declare function getCommonDbColumnDefinitions(Sequelize: any): {
    id: {
        allowNull: boolean;
        primaryKey: boolean;
        type: any;
    };
    deleted_at: {
        type: any;
    };
    deleted: {
        type: any;
        defaultValue: number;
    };
    created_at: {
        allowNull: boolean;
        type: any;
        defaultValue: any;
    };
    updated_at: {
        type: any;
    };
};
