// index.js
let deckId;

// Function to create a new deck and draw the four aces
function createDeck() {
  fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then((response) => response.json())
    .then((data) => {
      deckId = data.deck_id;
      drawAces();
    })
    .catch((error) => {
      console.error("Error creating deck:", error);
    });
}

// Function to draw a card from the deck
function drawCard() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/discard/draw/?count=1`)
      .then(response => response.json())
      .then(data => {
          const card = data.cards[0];
          const cardContainer = document.getElementById('card-container');
          cardContainer.innerHTML = `<img src="${card.image}" alt="${card.value} of ${card.suit}">`;
      })
      .catch(error => {
          console.error('Error drawing card:', error);
      });
}

// Function to draw the four aces and add back the remaining cards
function drawAces() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`)
      .then(response => response.json())
      .then(data => {
          console.log(data); // Check the data returned from the API
          const allCards = data.cards;
          const aces = allCards.filter(card => card.value === 'ACE');
          console.log(aces); // Check the filtered aces
          generateTable(aces);
          const nonAceCodes = allCards.filter(card => card.value !== 'ACE').map(card => card.code);
          // Add back the non-ace cards to the deck
          fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/discard/add/?cards=${nonAceCodes.join(',')}`)
              .then(response => response.json())
              .then(data => {
                  console.log('Non-ace cards added back to the deck:', data);
              })
              .catch(error => {
                  console.error('Error adding non-ace cards back to the deck:', error);
              });
      })
      .catch(error => {
          console.error('Error drawing aces:', error);
      });
}

// Function to generate the 9x5 table and place card back images and aces
function generateTable(aces) {
  const cardTable = document.getElementById("card-table");
  const cardBackSrc = "../images/card back orange.png";
  let tableHTML = "";

  for (let i = 0; i < 9; i++) {
    tableHTML += "<tr>";
    for (let j = 0; j < 5; j++) {
      if (i === 8 && j < aces.length) {
        // Place aces in the bottom row
        const ace = aces[j];
        if (ace) {
          tableHTML += `<td><img src="${ace.image}" alt="${ace.value} of ${ace.suit}"></td>`;
        } else {
          tableHTML += "<td></td>"; // If there are less than 4 aces
        }
      } else if (j === 4 && i >= 1 && i < 8) {
        // Place card backs in the last column starting from the second row
        tableHTML += `<td><img src="${cardBackSrc}" alt="Card Back"></td>`;
      } else {
        tableHTML += "<td></td>";
      }
    }
    tableHTML += "</tr>";
  }

  cardTable.innerHTML = tableHTML;
}

// Initial setup
createDeck();
