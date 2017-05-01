import SimpleSchema from 'simpl-schema';

const ColumnSchema = new SimpleSchema({
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
    createdBy: {
        type: String,
    }
});

export default ColumnSchema;