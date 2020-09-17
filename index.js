const mealsEl = document.getElementById("meals");
const favouriteContainer = document.getElementById("fav-meals");
const mealInfoEl = document.getElementById("meal-info");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
  const resData = await res.json();
  const randomMeal = resData.meals[0];

  //console.log(randomMeal);
  addMeals(randomMeal, true);
}

async function getMealById(id) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );

  const resData = await res.json();
  const meal = resData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const res = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const resData = await res.json();
  const meals = resData.meals;

  return meals;
}

function addMeals(mealData, random = false) {
  console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = `
        
            <div class="meal-header">
                ${
                  random ? `<span class="random">Random Recipe</span>` : ""
                } </span>

                <img
                    src="${mealData.strMealThumb}"
                    alt="${mealData.strMeal}"
                />
            </div>
            <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
    `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMoveLS(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealsLS(mealData.idMeal);
      btn.classList.add("active");
    }

    fetchFavMeals();
  });

  const imgMeal = meal.querySelector("img");

  imgMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  mealsEl.appendChild(meal);
}

function addMealsLS(mealId) {
  const mealIds = getMealsLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMoveLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  //clean the fav-container
  favouriteContainer.innerHTML = "";

  const mealIds = getMealsLS();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    const meal = await getMealById(mealId);

    addMealFav(meal);
  }
}

function addMealFav(mealData) {
  console.log(mealData);

  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
    <img
        src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"
    /><span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMoveLS(mealData.idMeal);

    fetchFavMeals();
  });

  const imgMeal = favMeal.querySelector("img");
  imgMeal.addEventListener("click", () => {
    showMealInfo(mealData);
  });

  favouriteContainer.appendChild(favMeal);
}

function showMealInfo(mealData) {
  //clean
  mealInfoEl.innerHTML = "";

  const mealEl = document.createElement("div");

  const ingredients = [];
  //get ingredient and measure
  for (let i = 1; i <= 20; i++) {
    if (mealData["strIngredient" + i]) {
      ingredients.push(
        `${mealData["strIngredient" + i]} - ${mealData["strMeasure" + i]}`
      );
    } else {
      break;
    }
  }

  mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img
      src="${mealData.strMealThumb}"
      alt="${mealData.strMealThumb}"
    />
    <p>
      ${mealData.strInstructions}
    </p>
    <h3>Ingredient:</h3>
    <ul>
      ${ingredients
        .map(
          (ing) => `
      <li>
      ${ing}
      </li>`
        )
        .join("")}
    </ul>
    
  `;

  mealInfoEl.appendChild(mealEl);
  mealPopup.classList.remove("hidden");
}

searchBtn.addEventListener("click", async () => {
  //clear container b4 search
  mealsEl.innerHTML = "";

  const search = searchTerm.value;

  // console.log(await getMealsBySearch(search));
  const meals = await getMealsBySearch(search);

  if (meals) {
    meals.forEach((meal) => {
      addMeals(meal);
    });
  }
});

popupCloseBtn.addEventListener("click", () => {
  mealPopup.classList.add("hidden");
});
