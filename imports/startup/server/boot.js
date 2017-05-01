//create
Meteor.startup(() => {
    if(!Meteor.users.findOne()){
        Accounts.createUser({
            username: 'alex',
            email: 'frayeralex@gmail.com',
            password: 'asdfasdf',
            profile: {
                firstName: 'Oleksiy',
                lastName: 'Boyko'
            }
        });
    }
});