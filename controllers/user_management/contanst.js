export const userManagementLookup = [
    {
        $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            pipeline: [
                {
                    $project: {
                        id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        mobileNo: 1,
                    }
                }
            ],
            as: "created_user_details"
        }
    },
    {
        $unwind: {
            path: "$created_user_details",
            preserveNullAndEmptyArrays: true
        }
    },
    {
        $lookup: {
            from: "users",
            localField: "updatedBy",
            foreignField: "_id",
            pipeline: [
                {
                    $project: {
                        id: 1,
                        firstName: 1,
                        lastName: 1,
                        email: 1,
                        mobileNo: 1,
                    }
                }
            ],
            as: "updated_user_details"
        }
    },
    {
        $unwind: {
            path: "$updated_user_details",
            preserveNullAndEmptyArrays: true
        }
    }
];
