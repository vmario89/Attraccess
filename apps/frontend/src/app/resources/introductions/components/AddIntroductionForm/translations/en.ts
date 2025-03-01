export default {
  addNew: {
    label: 'username or email',
    button: 'Add',
  },
  error: {
    emptyIdentifier: {
      title: 'No User Specified',
      description: 'Please enter a username or email to add an introduction',
    },
    addFailed: {
      title: 'Failed to Add Introduction',
      description:
        'There was an error adding the introduction. Please try again.',
    },
  },
  success: {
    title: 'Introduction Added',
    description: 'Successfully added introduction for {{user}}',
  },
};
