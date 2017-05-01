import SimpleSchema from 'simpl-schema';

const CommentSchema = new SimpleSchema({
    text: {
        type: String,
    },
    taskId: {
        type: String,
    },
    createdBy: {
        type: String,
    },
    parent: {
        type: String,
        optional: true,
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date();
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date()};
            } else {
                this.unset();  // Prevent user from supplying their own value
            }
        }
    },
    updatedAt: {
        type: Date,
        autoValue: function() {
            if (this.isUpdate) {
                return new Date();
            }
        },
        optional: true,
    },
});

export default CommentSchema;