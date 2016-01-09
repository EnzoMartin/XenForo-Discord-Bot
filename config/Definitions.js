var userLevels = {
    guest:{
        level: 0,
        label: 'Guest'
    },
    member: {
        level: 1,
        label: 'Member'
    },
    donor: {
        level: 2,
        label: 'Donor'
    },
    moderator: {
        level: 4,
        label: 'Moderator'
    },
    admin: {
        level: 5,
        label: 'Admin'
    }
};

module.exports = {
    vars: {
        userLevels: userLevels
    },
    actions: {

    }
};