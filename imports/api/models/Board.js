import SimpleSchema from 'simpl-schema';

const BoardSchema = new SimpleSchema({
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
    members: {
        type: Array,
    },
    'members.$': {
        type: String,
    },
    createdBy: {
        type: String,
    }
});

export default BoardSchema;