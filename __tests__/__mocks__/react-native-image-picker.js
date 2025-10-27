module.exports = {
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
  MediaType: {
    photo: 'photo',
    video: 'video',
    mixed: 'mixed',
  },
  ImagePickerResponse: {
    didCancel: false,
    errorMessage: null,
    assets: null,
  },
};
