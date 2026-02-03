document.addEventListener("DOMContentLoaded", init);

function init() {
  fetchCharacterList();
}

async function fetchCharacterList() {
  try {
    const response = await fetch("https://thronesapi.com/api/v2/Characters");
    const characters = await response.json();
    renderCharacterList(characters);
    fetchCharacterDetails(characters[0].id);
  } catch (err) {
    document.getElementById("error").textContent = "Could not load characters.";
    console.error(err);
  }
}

function renderCharacterList(characters) {
  const list= document.getElementById("list");
  list.innerHTML = "";

characters.forEach(character => {
  const item = document.createElement("div");
  item.classList.add("character-item");

  const thumb = document.createElement("img");
  thumb.src = character.imageUrl;
  thumb.alt = character.fullName;
  thumb.width = 50;

  const name = document.createElement("span");
  name.textContent = character.fullName;

  item.appendChild(thumb);
  item.appendChild(name);

  item.addEventListener("click", () => {
    fetchCharacterDetails(character.id);
  });

  list.appendChild(item);
});

}

async function fetchCharacterDetails(id) {
  try {
    const response = await fetch(`https://thronesapi.com/api/v2/Characters/${id}`);
    const character = await response.json();
    renderCharacterDetails(character);
  } catch (err) {
    document.getElementById("error").textContent = "Could not load character details"
    console.error(err);
  }
}

function renderCharacterDetails(character) {
  const fullName = `${character.firstName} ${character.lastName}`;
  document.getElementById("detail-fullName").textContent = fullName;
  document.getElementById("detail-title").textContent = character.title || "No title";
  document.getElementById("detail-family").textContent = character.family || "No family";

  const detailImage = document.getElementById("detail-image");
  if (character.imageUrl) {
    detailImage.src = character.imageUrl;
    detailImage.alt = `Image of ${fullName}`;
    detailImage.style.display = "block"
  } else {
    detailImage.style.display = "none";
    document.getElementById("error").textContent = "No image available";
  }
}