import React from 'react';
import './Card.css';

const CardItem = ({ image, thumb, title, status, description, onClick }) => (
  <li>
    <a href="#" className="card" onClick={(e) => { e.preventDefault(); onClick(); }}>
      <img src={image} className="card__image" alt="" />
      <div className="card__overlay">
        <div className="card__header">
          <svg className="card__arc" xmlns="http://www.w3.org/2000/svg">
            <path />
          </svg>
          <img className="card__thumb" src={thumb} alt="" />
          <div className="card__header-text">
            <h3 className="card__title">{title}</h3>
            <span className="card__status">{status}</span>
          </div>
        </div>
        <p className="card__description">{description}</p>
      </div>
    </a>
  </li>
);

const Card = () => {
  const cardsData = [
    {
      image: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      thumb: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      title: 'Panque',
      status:  'panque',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
    },
    {
      image: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      thumb: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      title: 'Panque',
      status:  'panque',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
    },
    {
      image: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      thumb: 'https://www.aestheticnursing.co.uk/media/s3cfbfyo/joan-2021-10-10-478_f02.jpg',
      title: 'Panque',
      status:  'panque',
      description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
    },
   
    
  ];

  const handleCardClick = (title) => {
    console.log(`Card clicked: ${title}`);
  };

  return (
    <ul className="cards">
      {cardsData.map((card, index) => (
        <CardItem
          key={index}
          image={card.image}
          thumb={card.thumb}
          title={card.title}
          status={card.status}
          description={card.description}
          onClick={() => handleCardClick(card.title)}
        />
      ))}
    </ul>
  );
};

export default Card;
