import graduationPic from "../../../assets/images/darkGraduationPic.png";


// Defining the AboutImages object inside the CarImage component causes it to be recreated on every render, which may introduce unnecessary overhead, particularly for complex objects or frequently re-rendered components.

// To enhance efficiency, it's advisable to define the AboutImages object separately and import it into the CarImage component. This ensures the object is created only once and can be reused across multiple components without redundancy.


export const AboutImages = {
    graduationPic
};
