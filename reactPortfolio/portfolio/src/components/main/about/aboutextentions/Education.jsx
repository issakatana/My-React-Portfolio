import React from 'react';

const Education = () => {
  return (
    <div className='col-12 col-md-6 mt-3'>
      <div className='d-flex flex-wrap mx-4'>
        <div className='col-12'>
          <p className='mb-2 fw-bold'>SOUTH EASTERN KENYA UNIVERSITY</p>
          <h1 className='fs-6'> Aug 2018 - Aug 2022 </h1>
          <p className='mb-2'>Bachelor Of Science In Statistics</p> 
        </div>
        <div className='col-12'>
          <p className='mb-2 fw-bold'>MALINDI HIGH SCHOOL</p>
          <h1 className='fs-6'> Feb 2014 - Dec 2017 </h1>
          <p className='mb-2'>Kenya Certificate Of Secondary Education</p> 
        </div>
        <div className='col-12'>
          <p className='mb-2 fw-bold'>BAMBA PRIMARY SCHOOL</p>
          <h1 className='fs-6'> Jan 2006 - Nov 2013 </h1>
          <p className='mb-2'>Kenya Certificate Of Primary Education</p>  
        </div>
      </div>
    </div>
  );
};

export default Education;
