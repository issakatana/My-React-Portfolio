const formData = {
    personalDetails: {
      surname: "",
      firstName: "",
      otherNames: "",
      gender: "",
      idNumber: "",
      dateOfBirth: "",
      position: "",
    },
    contactDetails: {
      phoneNumber: "",
      email: "",
      homeCounty: "",
      subCounty: "",
      ward: "",
      subLocation: "",
    },
    memberNominees: [
      {
        sno: 1,
        dependantsName: "",
        relationship: "",
        idNumber: "",
        contact: "",
      },
    ],
    nextOfKin: [
      {
        sno: 1,
        nameOfNextOfKin: "",
        relationship: "",
        idNumber: "",
        contact: "",
      },
    ],
    review: {
      personalDetailsReview: { ...formData.personalDetails },
      contactDetailsReview: { ...formData.contactDetails },
      memberNomineesReview: [],
      nextOfKinReview: [],
    },
};
  