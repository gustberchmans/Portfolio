let selectedAceIndex = null;
let drawingStarted = false;
let wins = 0;
let loses = 0;

// Function to create a new deck and draw the four aces
const createDeck = async () => {
  try {
    const response = await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1");
    const data = await response.json();
    deckId = data.deck_id;
    drawAces();
  } catch (error) {
    console.error("Error creating deck:", error);
  }
}

// Function to draw the four aces and add back the remaining cards
function drawAces() {
  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`)
    .then((response) => response.json())
    .then(({ cards: allCards }) => {
      const aces = allCards.filter(({ value }) => value === "ACE");

      // Sort the aces by their suit
      aces.sort((a, b) => {
        if (a.suit < b.suit) return -1;
        if (a.suit > b.suit) return 1;
        return 0;
      });

      generateTable(aces);

      const nonAceCodes = allCards
        .filter(({ value }) => value !== "ACE")
        .map(({ code }) => code);

      // Add back the non-ace cards to the deck
      fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/discard/add/?cards=${nonAceCodes.join(",")}`)
        .then((response) => response.json())
        .catch((error) => {
          console.error("Error adding non-ace cards back to the deck:", error);
        });
    })
    .catch((error) => {
      console.error("Error drawing aces:", error);
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
      if (i === 8) {
        if (j < aces.length) {
          // Place aces in the bottom row
          const ace = aces[j];
          if (ace) {
            // Add data attributes to identify the ace and apply the border class
            tableHTML += `<td><img src="${ace.image}" alt="${ace.value} of ${ace.suit}" data-value="${ace.value}" data-index="${j}" class="ace-border" onclick="selectAce(${j}, '${ace.suit}')"></td>`;
          } else {
            tableHTML += "<td></td>"; // If there are less than 4 aces
          }
        } else {
          tableHTML += "<td></td>"; // For empty cells in the bottom row
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

function selectAce(index, suit) {
  if (drawingStarted) return;

  const previousSelectedAce = document.querySelector('.selected-ace');
  if (previousSelectedAce) {
    previousSelectedAce.classList.remove('selected-ace');
  }

  selectedAceIndex = index;
  const aceImage = document.querySelector(`#card-table img[data-index="${index}"]`);
  aceImage.classList.add('selected-ace');

  // Save the selected suit in local storage
  localStorage.setItem('selectedAceSuit', suit);
  console.log(`Selected Ace: ${aceImage.alt}`);
}

// Function to draw a card from the deck
function drawCard() {
  if (selectedAceIndex === null) {
    alert("Please select an ace before drawing cards.");
    return;
  }

  drawingStarted = true;

  fetch(`https://deckofcardsapi.com/api/deck/${deckId}/pile/discard/draw/?count=1`)
    .then((response) => response.json())
    .then((data) => {
      const [card] = data.cards;
      const cardContainer = document.getElementById("card-container");

      // Create a new image element for the drawn card
      const cardImage = document.createElement("img");
      cardImage.src = card.image;
      cardImage.alt = `${card.value} of ${card.suit}`;
      cardImage.classList.add('drawn-card'); // Add class to style the drawn card

      // Append the new card image next to the button
      cardContainer.appendChild(cardImage);

      // Extract the symbol from the drawn card
      const { suit: symbol } = card;

      // Update the position of the corresponding ace
      moveAce(symbol);

      // Keep only the last drawn card in the container
      const images = cardContainer.querySelectorAll("img:not([alt='Deck of cards'])");
      if (images.length > 1) {
        cardContainer.removeChild(images[0]);
      }

      // Remove the class after the animation completes
      setTimeout(() => {
        cardImage.classList.remove('drawn-card');
      }, 1000); // Adjust the timeout to match the animation duration
    })
    .catch((error) => {
      console.error("Error drawing card:", error);
    });
}

// Function to move the corresponding ace up in the table
function moveAce(symbol) {
  // Determine which ace corresponds to the drawn symbol
  let aceIndex;
  switch (symbol) {
    case "CLUBS":
      aceIndex = 0;
      break;
    case "DIAMONDS":
      aceIndex = 1;
      break;
    case "HEARTS":
      aceIndex = 2;
      break;
    case "SPADES":
      aceIndex = 3;
      break;
    default:
      return; // If the symbol is not relevant for aces, exit the function
  }

  // Select the corresponding ace element and its parent cell
  const aceImage = document.querySelector(`#card-table img[data-value="ACE"][data-index="${aceIndex}"]`);
  const aceCell = aceImage.parentNode;

  if (aceCell) {
    const currentRow = aceCell.parentNode;
    const previousRow = currentRow.previousElementSibling;
    if (previousRow) {
      const currentColumn = aceCell.cellIndex;
      const targetRow = previousRow.children[currentColumn];
      if (targetRow) {
        // Move the ace image to the target row and same column
        targetRow.appendChild(aceImage);

        // Delay showing the alert by 100 milliseconds
        setTimeout(() => {
          if (currentRow.rowIndex === 1) {
            selectedAceIndex = null;
            drawingStarted = false;
            // Check if the selected ace's suit matches the suit of the last drawn card
            const selectedAceSuit = localStorage.getItem('selectedAceSuit');
            const lastDrawnCardSuit = symbol;
            if (selectedAceSuit === lastDrawnCardSuit) {
              wins++;
              document.getElementById("wins-display").textContent = wins;
            } else {
              loses++;
              document.getElementById("loss-count").textContent = loses;
            }

            const totalGames = wins + loses;
            if (totalGames != 0) {
              winPercentage = wins/totalGames * 100;
            }
            document.getElementById("win-percentage").textContent = winPercentage;

            Swal.fire({
              title: `The suit ${symbol} won!`,
              text: "Do you want to play again?",
              icon: "success",
              showCancelButton: false,
              confirmButtonText: "Play Again",
              cancelButtonText: "Cancel"
            }).then((result) => {
              if (result.isConfirmed) {
                createDeck(); // Restart the game
              }
            });
          }
        }, 100);
      }
    }
  }
}

// Initial setup
(function() {
  createDeck();
})();
