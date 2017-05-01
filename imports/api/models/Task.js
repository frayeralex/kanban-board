import SimpleSchema from 'simpl-schema';

const TaskSchema = new SimpleSchema({
    name: {
        type: String,
    },
    description: {
        type: String,
        optional: true,
    },
    order: {
        type: SimpleSchema.Integer,
    },
    boardId: {
        type: String,
    },
    columnId: {
        type: String,
    },
    members: {
        type: Array,
        defaultValue: [],
    },
    'members.$': {
        type: String,
    },
    timeDue: {
        type: Date,
        optional: true,
    },
    attachments: {
        type: Array,
        defaultValue: [],
    },
    "attachments.$":{
        type: Object,
        blackbox: true,
    },
    checkList: {
        type: Array,
        defaultValue: [],
    },
    "checkList.$": {
        type: Object,
    },
    'checkList.$.title': {
        type: String,
    },
    'checkList.$.items': {
        type: Array,
    },
    'checkList.$.items.$': {
        type: Object,
    },
    'checkList.$.items.$.title': {
        type: String,
    },
    'checkList.$.items.$.done': {
        type: Boolean,
    },
    createdBy: {
        type: String,
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

export default TaskSchema;