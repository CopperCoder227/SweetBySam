import React from 'react';


const ClubCard = ({ name, teacher, description, contact, location }) => {
    return (
        <div className="club-card">
            <h2 className="sport-name">{name}</h2>
            <h3 className="sport-teacher">Coach/Teacher: {teacher}</h3>
            <p className="sport-description">{description}</p>
            <p className="sport-contact">Contact: {contact}</p>
            <p className="sport-location">Location: {location}</p>
        </div>
    );
};


export default ClubCard;

