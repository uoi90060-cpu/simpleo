/* ==========================================================================
   SIMPLE COOK — seed data
   --------------------------------------------------------------------------
   Everything the site shows on first load lives here. In a real product this
   file is replaced by database tables / API responses (see README.md).

   PHOTOS
   Each entry in PHOTO is either
     • an Unsplash photo id  → loaded from images.unsplash.com, or
     • a path / full URL     → used as-is (e.g. "assets/images/pizza.jpg").
   To swap any picture, change its value here. Nothing else needs editing.
   If an image fails to load, script.js draws an illustrated plate instead,
   so cards never show a broken-image icon.
   ========================================================================== */
(function () {
  const PHOTO = {
    /* hero + banners */
    heroMain: "1504674900247-0877df9cc836",
    heroPizza: "1565299624946-b28f40a0ae38",
    heroPasta: "1473093295043-cdd812d0e601",
    heroBurger: "1551782450-a2132b4ba21d",
    heroPancakes: "1567620905732-2d1ec7ab7445",
    ctaBg: "1414235077428-338989a2e8c0",
    authBg: "1476224203421-9ac39bcb3327",

    /* official recipes */
    pizzaClassic: "1513104890138-7c749659a591",
    spaghetti: "1563379926898-05f4575a45d8",
    friedChicken: "1626645738196-c2a7c87a8f58",
    gardenSalad: "1512621776951-a57141f2eefd",
    chocCake: "1578985545062-69928b1d9587",
    lasagne: "1619895092538-128341789043",
    mushroomPasta: "1621996346565-e3dbc646d9a9",
    koreanChicken: "1562967914-608f82629710",
    greekSalad: "1540189549336-e6e99c3679fe",
    tiramisu: "1571877227200-a0d98ea607e9",
    chickenRice: "1512058564366-18510be2db19",
    beefBurger: "1568901346375-23c9450c58cd",
    pancakes: "1567620905732-2d1ec7ab7445",
    frenchToast: "1484723091739-30a097e8f929",
    garlicBread: "1619531040576-f9416740661b",
    curry: "1565557623262-b51c2513a641",
    tacos: "1565299585323-38d6b0865b47",
    brownies: "1564355808539-22fda35bed7e",
    cheesecake: "1533134242443-d4fd215305ad",
    applePie: "1535920527002-b35e96722eb9",
    avocadoToast: "1541519227354-08fa5d50c44d",
    steak: "1544025162-d76694265947",
    smoothieBowl: "1511690743698-d9d85f2fbf38",
    lemonade: "1513558161293-cdaf765ed2fd",

    /* community recipes */
    tunaPizza: "1574071318508-1cdbab80d002",
    garlicPasta: "1551183053-bf91a1d81141",
    crispyChicken: "1598103442097-8b74394b95c6",
    freshSalad: "1546069901-ba9599a7e63c",
    chocCakeLayers: "1606313564200-e75d5e30476c",
    mushroomPasta2: "1612874742237-6526221588e3",
    chickenRice2: "1585937421612-70a008356fbe",
    homeBurger: "1550547660-d9450f859349",
    garlicBread2: "1509440159596-0249088772ff",
    shakshuka: "1590412200988-a436970781fa",
    ramen: "1569718212165-3a8278d5f624",
    mangoLassi: "1497534446932-c925b458314e",
    cookies: "1499636136210-6f4ee915583e",

    /* reels + videos (portrait / landscape crops of extra shots) */
    reelPizza: "1571407970349-bc81e7e96d47",
    reelCake: "1464349095431-e9a21285b5f3",
    reelBreakfast: "1525351484163-7529414344d8",
    reelSmash: "1572802419224-296b0aeee0d9",
    reelSalad: "1505576399279-565b52d4ac71",
    reelLava: "1624353365286-3f8d62daad51",
    reelTacos: "1551504734-5ee1c4a1479b",
    vidPizza: "1593560708920-61dd98c46a4e",
    vidCake: "1571115177098-24ec42ed204d",
    vidMealPrep: "1498837167922-ddd27525d352",
    vidTacos: "1599974579688-8dbdd335c77f",
    vidFamily: "1555939594-58d7cb561ad1",
    vidBreakfast: "1493770348161-369560ae357d",

    /* category tiles */
    catBeef: "1544025162-d76694265947",
    catAsian: "1569718212165-3a8278d5f624",
    catBaking: "1509440159596-0249088772ff",
    catDrinks: "1544145945-f90425340c7e",
    catVeg: "1498837167922-ddd27525d352",
    catItalian: "1621996346565-e3dbc646d9a9",
    catQuick: "1525351484163-7529414344d8",
  };

  /** Builds an image URL for a PHOTO key (or passes through data:/http/path values). */
  function photoUrl(key, w, h) {
    const v = PHOTO[key] || key || "";
    if (!v) return "";
    if (/^(data:|blob:|https?:|\/|\.|assets\/)/.test(v)) return v;
    return (
      "https://images.unsplash.com/photo-" + v +
      "?auto=format&fit=crop&q=80&w=" + (w || 900) + (h ? "&h=" + h : "")
    );
  }

  /* ------------------------------------------------------------------ */
  /* Categories                                                          */
  /* ------------------------------------------------------------------ */
  const CATEGORIES = [
    { id: "pizza", name: "Pizza", photo: "pizzaClassic", home: true },
    { id: "pasta", name: "Pasta", photo: "heroPasta", home: true },
    { id: "chicken", name: "Chicken", photo: "friedChicken", home: true },
    { id: "beef", name: "Beef", photo: "catBeef" },
    { id: "desserts", name: "Desserts", photo: "chocCake", home: true },
    { id: "breakfast", name: "Breakfast", photo: "pancakes", home: true },
    { id: "healthy", name: "Healthy", photo: "gardenSalad", home: true },
    { id: "vegetarian", name: "Vegetarian", photo: "catVeg", home: true },
    { id: "asian", name: "Asian", photo: "catAsian", home: true },
    { id: "italian", name: "Italian", photo: "catItalian", home: true },
    { id: "mexican", name: "Mexican", photo: "tacos" },
    { id: "baking", name: "Baking", photo: "catBaking", home: true },
    { id: "quick", name: "Quick Meals", photo: "catQuick", home: true },
    { id: "drinks", name: "Drinks", photo: "catDrinks", home: true },
  ];

  /* ------------------------------------------------------------------ */
  /* Creators                                                            */
  /* ------------------------------------------------------------------ */
  const USERS = [
    { id: "anis", username: "anis", name: "Anis", bio: "Home cook & food lover. Sunday pizza is a personal religion.", followers: 3420, following: 128, points: 2480, hue: 14 },
    { id: "maria", username: "maria", name: "Maria Rossi", bio: "Pasta obsessed. Weeknight dinners made simple, with a little nonna magic.", followers: 18240, following: 212, points: 9820, hue: 340 },
    { id: "chefali", username: "chefali", name: "Chef Ali", bio: "Professional chef. Crispy, golden and juicy: that's the whole philosophy.", followers: 24610, following: 96, points: 12740, hue: 28 },
    { id: "lina", username: "lina", name: "Lina", bio: "Breakfast & brunch ideas every morning. Coffee first, always.", followers: 8910, following: 301, points: 5310, hue: 168 },
    { id: "sweettooth", username: "sweettooth", name: "Sweet Tooth", bio: "Cakes, cookies and everything sugar. Baking is my love language.", followers: 15120, following: 174, points: 8460, hue: 318 },
    { id: "sam", username: "sam", name: "Sam Carter", bio: "Burgers, tacos and street food you can make at home.", followers: 6340, following: 143, points: 3890, hue: 4 },
    { id: "foodlover", username: "foodlover", name: "Food Lover", bio: "Eating my way through every cuisine, one kitchen at a time.", followers: 4720, following: 388, points: 2970, hue: 44 },
    { id: "cookwithme", username: "cookwithme", name: "Cook With Me", bio: "Easy, healthy meals for busy people. Meal prep is my superpower.", followers: 11430, following: 129, points: 6650, hue: 142 },
  ];

  /* ------------------------------------------------------------------ */
  /* Recipes                                                             */
  /*   s = [likes, dislikes, comments, saves, shares, views]             */
  /*   age = days since posted                                           */
  /* ------------------------------------------------------------------ */
  const OFFICIAL = "simplecook";

  const FIXED = [
    {
      id: "classic-italian-pizza", ph: "pizzaClassic", title: "Classic Italian Pizza", diff: "Hard",
      cats: ["pizza", "italian", "vegetarian"], tags: ["pizza", "dough", "margherita", "mozzarella"],
      prep: 90, cook: 12, serves: 2, s: [6240, 41, 318, 4180, 1120, 98200], age: 62,
      desc: "A blistered, chewy-crisp crust with sweet tomato, milky mozzarella and fresh basil. The dough takes patience; the payoff is pizzeria-level.",
      ing: ["500 g strong bread flour (or 00 flour)", "325 ml warm water", "10 g fine sea salt", "3 g instant yeast", "1 tbsp olive oil", "400 g canned whole tomatoes", "250 g fresh mozzarella", "Fresh basil leaves", "Extra virgin olive oil, to finish"],
      steps: [
        "Stir the yeast into the warm water. Mix with the flour and salt until a shaggy dough forms, add the olive oil, then knead for 10 minutes until smooth and stretchy.",
        "Cover the bowl and leave the dough somewhere warm for about 1 hour, until doubled. Divide into two balls and rest for another 20 minutes.",
        "Crush the tomatoes by hand with a pinch of salt. Tear the mozzarella into pieces and blot on paper towel so the pizza doesn't turn watery.",
        "Heat your oven to its highest setting (about 250 °C / 480 °F) with a baking steel, stone or upside-down tray inside for at least 30 minutes.",
        "Stretch each ball by hand into a 25 cm round, keeping the edge slightly thicker. Spread a thin layer of tomato and scatter over the mozzarella.",
        "Slide onto the hot surface and bake for 8 to 12 minutes, until the crust is blistered and the cheese is bubbling. Finish with basil and a drizzle of olive oil.",
      ],
      tips: ["A screaming-hot oven is what gives you a puffy, leopard-spotted crust.", "Go easy on toppings. Less bakes better and keeps the base crisp.", "For deeper flavour, rest the dough balls in the fridge overnight and bring to room temperature before stretching."],
    },
    {
      id: "classic-spaghetti", ph: "spaghetti", title: "Classic Spaghetti", diff: "Easy",
      cats: ["pasta", "italian", "vegetarian"], tags: ["spaghetti", "tomato", "weeknight"],
      prep: 10, cook: 30, serves: 4, s: [4870, 52, 241, 3320, 780, 76400], age: 80,
      desc: "Silky garlic-and-tomato sauce, perfectly al dente spaghetti, a snowfall of Parmesan. The dinner you can make with your eyes closed.",
      ing: ["400 g spaghetti", "3 tbsp olive oil", "4 garlic cloves, thinly sliced", "800 g canned chopped tomatoes", "1 tsp sugar", "Salt and black pepper", "Small handful of basil", "40 g Parmesan, finely grated", "Pinch of chilli flakes (optional)"],
      steps: [
        "Warm the olive oil in a wide pan over low heat. Add the garlic and cook gently for 1 to 2 minutes, until fragrant but not browned.",
        "Pour in the tomatoes, add the sugar, 1 tsp salt and the chilli. Simmer for 20 minutes, stirring now and then, until thick and glossy.",
        "Meanwhile, boil the spaghetti in well-salted water until 1 minute short of the packet time. Save a mug of pasta water, then drain.",
        "Toss the pasta through the sauce with a splash of pasta water and cook together for 1 minute so the sauce clings.",
        "Tear in the basil, season with pepper and serve with plenty of Parmesan.",
      ],
      tips: ["Salt your pasta water until it tastes like the sea; it's the only chance to season the pasta itself.", "The starchy pasta water is your secret weapon for a sauce that coats rather than pools.", "Sugar isn't for sweetness. It balances the acidity of canned tomatoes."],
    },
    {
      id: "crispy-fried-chicken", ph: "friedChicken", title: "Crispy Fried Chicken", diff: "Medium",
      cats: ["chicken"], tags: ["fried", "buttermilk", "crispy", "comfort"],
      prep: 30, cook: 25, serves: 4, s: [7120, 88, 402, 5410, 1830, 134000], age: 45,
      desc: "Buttermilk-brined chicken with a craggy, shatteringly crisp crust and juicy meat all the way through.",
      ing: ["8 chicken pieces (thighs and drumsticks)", "500 ml buttermilk", "1 tbsp hot sauce", "200 g plain flour", "2 tbsp cornflour", "2 tsp smoked paprika", "1 tsp garlic powder", "1 tsp onion powder", "2 tsp salt", "1 tsp black pepper", "Neutral oil, for frying"],
      steps: [
        "Combine the chicken, buttermilk, hot sauce and 1 tsp salt in a bowl. Cover and marinate in the fridge for at least 2 hours, or overnight.",
        "Whisk the flour, cornflour, paprika, garlic powder, onion powder, remaining salt and the pepper in a wide dish. Spoon 3 tbsp of the buttermilk into the flour and rub it in for craggy bits.",
        "Lift each piece out of the marinade, let the excess drip off, then press firmly into the flour. Rest on a rack for 10 minutes so the coating sets.",
        "Heat 5 cm of oil in a heavy pot to 170 °C / 340 °F. Fry in batches for 12 to 15 minutes, turning once, until deep golden and 74 °C / 165 °F inside.",
        "Drain on a wire rack (not paper towel) and sprinkle with a pinch of salt while hot.",
      ],
      tips: ["Keep the oil at 165 to 175 °C. Too hot and the crust burns before the meat is cooked.", "A wire rack keeps the underside from steaming and going soft.", "Don't crowd the pot. Fry in batches to keep the temperature up."],
    },
    {
      id: "fresh-garden-salad", ph: "gardenSalad", title: "Fresh Garden Salad", diff: "Easy",
      cats: ["healthy", "vegetarian", "quick"], tags: ["salad", "fresh", "light", "lemon"],
      prep: 15, cook: 0, serves: 4, s: [2310, 19, 96, 1490, 310, 41200], age: 100,
      desc: "Crunchy, colourful and bright with a lemon-mustard dressing. Proof that a simple salad can be the best thing on the table.",
      ing: ["1 butterhead or romaine lettuce", "2 ripe tomatoes", "1 cucumber", "1 red pepper", "1 carrot", "4 radishes", "½ small red onion, thinly sliced", "Small handful of mixed herbs", "3 tbsp olive oil", "1 tbsp lemon juice", "1 tsp Dijon mustard", "1 tsp honey", "Salt and pepper"],
      steps: [
        "Wash and thoroughly dry the lettuce, then tear it into bite-size pieces. Wet leaves dilute the dressing.",
        "Cut the tomatoes into wedges, slice the cucumber and pepper, shave the carrot into ribbons and thinly slice the radishes.",
        "Whisk the olive oil, lemon juice, mustard, honey, salt and pepper in a small jar until emulsified.",
        "Combine the vegetables, onion and herbs in a large bowl. Add half the dressing, toss gently and taste before adding more.",
        "Serve straight away while everything is crisp.",
      ],
      tips: ["Dress just before serving so the leaves stay crunchy.", "Soak sliced red onion in cold water for 10 minutes to mellow its bite.", "Toasted seeds or a handful of chickpeas turn it into a full meal."],
    },
    {
      id: "simple-chocolate-cake", ph: "chocCake", title: "Simple Chocolate Cake", diff: "Medium",
      cats: ["desserts", "baking", "vegetarian"], tags: ["cake", "chocolate", "ganache", "birthday"],
      prep: 25, cook: 35, serves: 10, s: [8940, 63, 512, 7020, 2210, 156000], age: 30,
      desc: "A deeply chocolatey, moist one-bowl cake topped with glossy two-ingredient ganache. Reliable for birthdays and bad days alike.",
      ing: ["250 g plain flour", "200 g caster sugar", "75 g cocoa powder", "2 tsp baking powder", "½ tsp bicarbonate of soda", "½ tsp salt", "2 eggs", "240 ml milk", "120 ml vegetable oil", "2 tsp vanilla extract", "240 ml hot strong coffee (or hot water)", "200 g dark chocolate, chopped", "200 ml double cream"],
      steps: [
        "Heat the oven to 175 °C / 350 °F. Grease and line two 20 cm round tins.",
        "Whisk the flour, sugar, cocoa, baking powder, bicarbonate and salt in a large bowl.",
        "Add the eggs, milk, oil and vanilla and whisk until smooth. Pour in the hot coffee and stir. The batter will be thin, and that's correct.",
        "Divide between the tins and bake for 30 to 35 minutes, until a skewer comes out with just a few moist crumbs. Cool completely.",
        "For the ganache, heat the cream until steaming, pour over the chopped chocolate, wait 2 minutes, then stir until glossy. Let it thicken for 20 minutes.",
        "Sandwich the layers with ganache and spread the rest over the top and sides.",
      ],
      tips: ["Hot coffee deepens the chocolate flavour without making the cake taste of coffee.", "Cool the cakes fully before frosting, or the ganache will slide off.", "Let the ganache thicken to a spreadable texture. Too warm and it runs."],
    },
    {
      id: "classic-lasagne", ph: "lasagne", title: "Classic Lasagne", diff: "Hard",
      cats: ["italian", "pasta", "beef"], tags: ["lasagne", "bechamel", "baked", "family"],
      prep: 45, cook: 120, serves: 8, s: [5760, 47, 289, 4620, 970, 88700], age: 71,
      desc: "Slow-simmered beef ragù, creamy béchamel and bubbling cheese in tender layers. A weekend project worth every minute.",
      ing: ["500 g beef mince", "1 onion, 1 carrot and 1 celery stick, finely chopped", "3 garlic cloves, minced", "2 tbsp tomato purée", "700 g passata", "150 ml red wine (optional)", "12 dried lasagne sheets", "60 g butter", "60 g plain flour", "800 ml whole milk", "Pinch of nutmeg", "200 g mozzarella, grated", "60 g Parmesan, grated"],
      steps: [
        "Soften the onion, carrot and celery in olive oil for 10 minutes. Add the garlic and beef and brown well, breaking up any clumps.",
        "Stir in the tomato purée, then the wine (if using) and let it bubble away. Add the passata, season and simmer gently for 1 hour until rich and thick.",
        "For the béchamel, melt the butter, stir in the flour and cook for 1 minute. Gradually whisk in the milk and simmer until it coats a spoon. Add nutmeg and salt.",
        "Heat the oven to 180 °C / 350 °F. Spread a little ragù in a large dish, then layer sheets, ragù, béchamel and a sprinkle of mozzarella. Repeat, finishing with béchamel.",
        "Top with the remaining mozzarella and the Parmesan. Bake for 40 minutes, until golden and bubbling.",
        "Rest for 15 minutes before cutting so the layers hold together.",
      ],
      tips: ["A longer, slower ragù is better. Two hours is even nicer.", "Resting the lasagne is the difference between neat squares and a puddle.", "It freezes beautifully. Assemble, wrap and freeze before baking."],
    },
    {
      id: "creamy-mushroom-pasta", ph: "mushroomPasta", title: "Creamy Mushroom Pasta", diff: "Easy",
      cats: ["pasta", "vegetarian", "italian", "quick"], tags: ["mushroom", "cream", "garlic", "thyme"],
      prep: 10, cook: 20, serves: 3, s: [3980, 31, 167, 2760, 540, 61800], age: 22,
      desc: "Golden-seared mushrooms in a garlicky Parmesan cream sauce, tossed through glossy pasta. Restaurant flavour in 30 minutes.",
      ing: ["300 g penne or tagliatelle", "350 g mushrooms, sliced", "3 garlic cloves, minced", "1 shallot, finely chopped", "200 ml double cream", "50 g Parmesan, grated", "2 tbsp butter", "1 tbsp olive oil", "Few sprigs of thyme", "Chopped parsley", "Salt and pepper"],
      steps: [
        "Cook the pasta in salted water until al dente. Reserve a cup of the pasta water and drain.",
        "Heat the oil and half the butter in a large pan over high heat. Add the mushrooms in a single layer and leave them alone for 3 minutes to brown before stirring.",
        "Lower the heat, add the rest of the butter, shallot, garlic and thyme and cook for 2 minutes.",
        "Pour in the cream and simmer for 3 minutes. Stir in the Parmesan until melted.",
        "Add the pasta with a splash of pasta water, toss until glossy, season and finish with parsley.",
      ],
      tips: ["Don't crowd the pan. Mushrooms steam instead of browning if they're stacked.", "Salt the mushrooms only after they brown to avoid a watery pan.", "A squeeze of lemon at the end brightens the richness."],
    },
    {
      id: "korean-crispy-chicken", ph: "koreanChicken", title: "Korean Crispy Chicken", diff: "Hard",
      cats: ["chicken", "asian"], tags: ["korean", "gochujang", "double-fried", "wings"],
      prep: 30, cook: 35, serves: 4, s: [6480, 74, 355, 5110, 1640, 121000], age: 18,
      desc: "Double-fried for an ultra-crunchy shell that stays crisp under a sticky, sweet-spicy gochujang glaze.",
      ing: ["900 g chicken wings or drumettes", "80 g potato starch (or cornflour)", "1 tsp salt", "½ tsp black pepper", "Neutral oil, for frying", "3 tbsp gochujang", "2 tbsp soy sauce", "3 tbsp honey", "2 tbsp rice vinegar", "4 garlic cloves, grated", "1 tbsp fresh ginger, grated", "1 tbsp sesame oil", "Sesame seeds and sliced spring onion, to serve"],
      steps: [
        "Pat the chicken very dry, season with salt and pepper, and toss in the starch until every piece is lightly coated.",
        "Heat 6 cm of oil to 160 °C / 320 °F. Fry in batches for 10 minutes until pale gold and cooked through. Drain on a rack.",
        "Meanwhile, simmer the gochujang, soy, honey, vinegar, garlic, ginger and sesame oil for 3 to 4 minutes until syrupy.",
        "Raise the oil to 190 °C / 375 °F. Fry the chicken a second time for 3 to 4 minutes until deep golden and very crisp.",
        "Toss immediately in the warm glaze. Scatter with sesame seeds and spring onion and serve at once.",
      ],
      tips: ["The second fry is what drives out moisture and makes the crust last.", "Potato starch gives a lighter, glassier crunch than flour.", "Glaze just before serving. Waiting will soften the crust."],
    },
    {
      id: "fresh-greek-salad", ph: "greekSalad", title: "Fresh Greek Salad", diff: "Easy",
      cats: ["healthy", "vegetarian", "quick"], tags: ["greek", "feta", "olives", "summer"],
      prep: 10, cook: 0, serves: 3, s: [2780, 22, 108, 1830, 360, 47100], age: 55,
      desc: "Ripe tomatoes, crunchy cucumber, briny olives and a slab of feta, dressed only with olive oil and oregano.",
      ing: ["4 ripe tomatoes, in chunks", "1 cucumber, thickly sliced", "1 green pepper, sliced", "1 small red onion, thinly sliced", "150 g feta, in one block", "12 Kalamata olives", "3 tbsp extra virgin olive oil", "1 tbsp red wine vinegar", "1 tsp dried oregano", "Sea salt"],
      steps: [
        "Combine the tomatoes, cucumber, pepper and onion in a wide bowl. Sprinkle with salt and let sit for 5 minutes.",
        "Add the olives, then whisk the olive oil and vinegar and pour over.",
        "Lay the block of feta on top, sprinkle with oregano and add a final drizzle of oil.",
        "Serve with crusty bread to mop up the juices.",
      ],
      tips: ["Use the ripest tomatoes you can find. There's nowhere to hide in this dish.", "Serve the feta in one slab. It stays creamier than crumbled.", "Don't add lettuce. A true Greek salad never has it."],
    },
    {
      id: "classic-tiramisu", ph: "tiramisu", title: "Tiramisu", diff: "Medium",
      cats: ["desserts", "italian", "vegetarian"], tags: ["tiramisu", "coffee", "mascarpone", "no-bake"],
      prep: 30, cook: 0, serves: 8, s: [7350, 58, 431, 6280, 1980, 142000], age: 90,
      desc: "Layers of coffee-soaked savoiardi and cloud-like mascarpone cream. No oven, only a night in the fridge.",
      ing: ["500 g mascarpone", "4 very fresh eggs, separated", "100 g caster sugar", "300 ml strong espresso, cooled", "3 tbsp coffee liqueur or Marsala", "About 24 savoiardi (ladyfingers)", "Cocoa powder, for dusting", "Dark chocolate, for shaving"],
      steps: [
        "Whisk the yolks and sugar until pale and thick, then fold in the mascarpone until smooth.",
        "In a clean bowl, whisk the egg whites to stiff peaks and gently fold into the mascarpone mixture in two additions.",
        "Mix the espresso and liqueur in a shallow dish. Dip each biscuit for 1 to 2 seconds only, then line the base of a dish.",
        "Spread half of the cream over the biscuits. Repeat with another layer of dipped biscuits and the rest of the cream. Smooth the top.",
        "Cover and chill for at least 6 hours, ideally overnight. Dust with cocoa and shave chocolate over just before serving.",
      ],
      tips: ["A quick dip is enough. Soaked biscuits turn the dessert soggy.", "Use the freshest eggs available, or pasteurised ones, since they're not cooked.", "It gets better on day two, once the flavours have melded."],
    },
    {
      id: "chicken-rice", ph: "chickenRice", title: "Chicken Rice", diff: "Medium",
      cats: ["asian", "chicken"], tags: ["rice", "ginger", "poached", "one-pot"],
      prep: 20, cook: 45, serves: 4, s: [4210, 40, 203, 3080, 690, 69800], age: 39,
      desc: "Tender poached chicken with rice cooked in the chicken broth, garlic and ginger, served with a zingy chilli-ginger sauce.",
      ing: ["4 bone-in chicken thighs, skin on", "300 g jasmine rice", "4 garlic cloves", "1 thumb-size piece of ginger, sliced", "3 spring onions", "1 tbsp sesame oil", "1 tsp salt", "Cucumber slices, to serve", "For the sauce: 2 tbsp grated ginger, 1 red chilli, 1 tbsp soy sauce, 1 tbsp lime juice, 1 tbsp hot broth"],
      steps: [
        "Place the chicken, half the ginger, 2 spring onions and the salt in a pot. Cover with water, bring to a gentle simmer and poach for 25 minutes, then remove and rest.",
        "Rinse the rice until the water runs clear. Sauté the remaining ginger and garlic in the sesame oil for 1 minute, add the rice and toss to coat.",
        "Add 450 ml of the strained chicken broth to the rice, bring to a boil, then cover and cook on the lowest heat for 15 minutes. Rest, covered, for 10 more.",
        "Blend the sauce ingredients or pound in a mortar until chunky.",
        "Slice the chicken, serve over the rice with cucumber, sauce and the last spring onion.",
      ],
      tips: ["Never let the poaching liquid boil hard, or the chicken turns stringy.", "Shock cooked chicken in iced water for extra-silky skin.", "Keep the leftover broth. It makes a wonderful soup."],
    },
    {
      id: "beef-burger", ph: "beefBurger", title: "Beef Burger", diff: "Medium",
      cats: ["beef"], tags: ["burger", "cheeseburger", "grill", "brioche"],
      prep: 20, cook: 12, serves: 4, s: [6890, 66, 377, 4370, 1350, 118000], age: 26,
      desc: "Juicy, well-seasoned beef patties with melty cheddar, toasted brioche and an easy special sauce.",
      ing: ["600 g beef mince (20% fat)", "4 brioche buns", "4 slices cheddar", "1 large tomato, sliced", "Lettuce leaves", "1 small red onion, sliced", "Pickles", "2 tbsp butter", "Salt and black pepper", "Sauce: 3 tbsp mayonnaise, 1 tbsp ketchup, 1 tsp mustard, 1 tsp pickle brine"],
      steps: [
        "Stir the sauce ingredients together and set aside.",
        "Divide the beef into 4 loose balls, flatten to 2 cm thick and press a shallow dimple in the centre of each. Season generously on both sides just before cooking.",
        "Heat a heavy pan or grill until very hot. Cook the patties 4 minutes on the first side without moving, flip and cook 3 minutes more, adding cheese for the last minute.",
        "Butter the buns and toast cut-side down in the pan until golden.",
        "Build with sauce, lettuce, tomato, patty, onion and pickles. Serve immediately.",
      ],
      tips: ["Handle the meat as little as possible. Overworked mince makes dense burgers.", "Keep the beef cold until it hits the pan.", "Salt only the outside, and only just before cooking."],
    },
    {
      id: "fluffy-pancakes", ph: "pancakes", title: "Fluffy Pancakes", diff: "Easy",
      cats: ["breakfast", "vegetarian", "quick"], tags: ["pancakes", "brunch", "maple", "berries"],
      prep: 10, cook: 15, serves: 4, s: [5420, 37, 262, 3650, 880, 92600], age: 12,
      desc: "Thick, cloud-soft American-style pancakes with golden edges. Ready in 25 minutes and made with pantry staples.",
      ing: ["200 g plain flour", "2 tbsp sugar", "2 tsp baking powder", "¼ tsp salt", "1 egg", "250 ml milk", "30 g melted butter", "1 tsp vanilla extract", "Butter, for the pan", "Maple syrup and fresh berries, to serve"],
      steps: [
        "Whisk the flour, sugar, baking powder and salt in a large bowl.",
        "In a jug, beat the egg, milk, melted butter and vanilla. Pour into the dry ingredients and stir until just combined. A few lumps are fine.",
        "Rest the batter for 5 minutes while you heat a non-stick pan over medium-low heat and rub with a little butter.",
        "Spoon in ⅓ cup batter per pancake. Cook until bubbles form and the edges look set, about 2 minutes, then flip and cook for 1 to 2 minutes more.",
        "Stack and serve with maple syrup, berries and a knob of butter.",
      ],
      tips: ["Don't over-mix. Lumpy batter equals fluffy pancakes.", "Keep the heat medium-low so the inside cooks before the outside browns.", "Keep finished pancakes warm on a tray in a low oven."],
    },
    {
      id: "french-toast", ph: "frenchToast", title: "French Toast", diff: "Easy",
      cats: ["breakfast", "vegetarian", "quick"], tags: ["french toast", "brioche", "cinnamon", "brunch"],
      prep: 10, cook: 10, serves: 2, s: [3360, 28, 141, 2210, 460, 58400], age: 33,
      desc: "Custardy in the middle, caramelised on the outside. A great way to rescue day-old bread.",
      ing: ["4 thick slices brioche or day-old bread", "2 eggs", "120 ml milk", "1 tbsp sugar", "½ tsp ground cinnamon", "1 tsp vanilla extract", "Butter, for frying", "To serve: berries, icing sugar, maple syrup"],
      steps: [
        "Whisk the eggs, milk, sugar, cinnamon and vanilla in a shallow dish.",
        "Soak each slice for about 20 seconds per side, until saturated but not falling apart.",
        "Melt a knob of butter in a pan over medium heat. Fry the slices for 2 to 3 minutes per side until golden brown.",
        "Serve hot, dusted with icing sugar and topped with berries and syrup.",
      ],
      tips: ["Slightly stale bread absorbs custard better without turning mushy.", "Medium heat prevents the outside from burning before the middle sets."],
    },
    {
      id: "garlic-bread", ph: "garlicBread", title: "Garlic Bread", diff: "Easy",
      cats: ["baking", "vegetarian", "italian", "quick"], tags: ["garlic", "bread", "butter", "side dish"],
      prep: 10, cook: 15, serves: 6, s: [4130, 34, 176, 2940, 750, 73900], age: 49,
      desc: "Crusty baguette, soaked with garlic-parsley butter until it's golden and irresistible.",
      ing: ["1 baguette", "100 g soft butter", "4 garlic cloves, crushed", "2 tbsp chopped parsley", "½ tsp salt", "50 g grated Parmesan (optional)", "Pinch of chilli flakes"],
      steps: [
        "Heat the oven to 200 °C / 400 °F. Mash the butter with the garlic, parsley, salt and chilli.",
        "Cut the baguette into thick slices without cutting all the way through the base.",
        "Spread the garlic butter between the slices and over the top. Sprinkle with Parmesan if you like.",
        "Wrap loosely in foil and bake for 10 minutes, then open the foil and bake for 5 minutes more until crisp and golden.",
      ],
      tips: ["Let the butter soften at room temperature so it spreads easily.", "Use fresh garlic. Jarred garlic tastes flat and bitter here."],
    },
    {
      id: "chicken-curry", ph: "curry", title: "Chicken Curry", diff: "Medium",
      cats: ["asian", "chicken"], tags: ["curry", "coconut", "spices", "dinner"],
      prep: 20, cook: 40, serves: 4, s: [5230, 44, 248, 4040, 810, 84300], age: 41,
      desc: "A deeply fragrant, mildly spiced curry with tender chicken in a creamy tomato-coconut sauce.",
      ing: ["700 g chicken thighs, cubed", "2 onions, finely chopped", "4 garlic cloves, minced", "1 thumb of ginger, grated", "2 tbsp curry powder", "1 tsp ground cumin", "400 g canned chopped tomatoes", "200 ml coconut milk", "2 tbsp oil", "1 tsp salt", "Fresh coriander", "Rice or naan, to serve"],
      steps: [
        "Heat the oil in a large pot and cook the onions for 10 minutes until soft and golden.",
        "Add the garlic and ginger for 1 minute, then stir in the curry powder and cumin and toast for 30 seconds until aromatic.",
        "Add the chicken and stir to coat. Pour in the tomatoes and salt, cover and simmer for 20 minutes.",
        "Stir in the coconut milk and simmer uncovered for 10 more minutes until the sauce is thick and glossy.",
        "Scatter with coriander and serve with rice or naan.",
      ],
      tips: ["Take the time to brown the onions properly. It builds the flavour base.", "Toast the spices in oil first to unlock their aroma.", "It tastes even better the next day."],
    },
    {
      id: "beef-tacos", ph: "tacos", title: "Beef Tacos", diff: "Medium",
      cats: ["mexican", "beef", "quick"], tags: ["tacos", "taco night", "salsa", "tortilla"],
      prep: 20, cook: 20, serves: 4, s: [4680, 51, 219, 3390, 720, 79500], age: 15,
      desc: "Smoky, well-spiced beef in warm tortillas with crunchy lettuce, fresh salsa and a squeeze of lime.",
      ing: ["500 g beef mince", "1 onion, finely chopped", "3 garlic cloves, minced", "2 tsp ground cumin", "2 tsp smoked paprika", "1 tsp dried oregano", "½ tsp chilli powder", "2 tbsp tomato purée", "8 small tortillas", "Shredded lettuce, tomato salsa, sour cream, grated cheese, lime, coriander"],
      steps: [
        "Brown the beef in a hot pan, breaking it up, until no pink remains. Drain off excess fat.",
        "Add the onion and cook for 4 minutes, then the garlic and spices for 1 minute.",
        "Stir in the tomato purée and 100 ml water. Simmer for 8 to 10 minutes until thick and saucy.",
        "Warm the tortillas in a dry pan for 20 seconds per side.",
        "Fill with beef, lettuce, salsa, cheese and sour cream. Finish with coriander and lime.",
      ],
      tips: ["Warming tortillas makes them pliable so they won't crack.", "Set up a taco bar and let everyone build their own."],
    },
    {
      id: "chocolate-brownies", ph: "brownies", title: "Chocolate Brownies", diff: "Easy",
      cats: ["desserts", "baking", "vegetarian"], tags: ["brownies", "fudgy", "chocolate", "one-bowl"],
      prep: 15, cook: 25, serves: 12, s: [7010, 49, 336, 5880, 1710, 129000], age: 8,
      desc: "Dark, fudgy brownies with a crackly top. Just one bowl and no mixer required.",
      ing: ["150 g dark chocolate", "150 g butter", "200 g caster sugar", "3 eggs", "80 g plain flour", "30 g cocoa powder", "Pinch of salt", "1 tsp vanilla extract", "100 g walnuts or chocolate chunks (optional)"],
      steps: [
        "Heat the oven to 175 °C / 350 °F and line a 20 cm square tin with baking paper.",
        "Melt the chocolate and butter together, stirring until smooth. Let cool for 5 minutes.",
        "Whisk in the sugar, then the eggs one by one, and the vanilla. Beat for 1 minute until glossy.",
        "Fold in the flour, cocoa and salt until just combined, then stir through the nuts or chocolate chunks.",
        "Bake for 22 to 25 minutes. The edges should be set and the centre slightly soft. Cool completely before slicing.",
      ],
      tips: ["Under-bake by a minute for extra fudgy brownies.", "Whisking the sugar and eggs well creates that shiny, crackly top.", "Chill before cutting for clean edges."],
    },
    {
      id: "classic-cheesecake", ph: "cheesecake", title: "Classic Cheesecake", diff: "Hard",
      cats: ["desserts", "baking", "vegetarian"], tags: ["cheesecake", "baked", "biscuit base", "creamy"],
      prep: 30, cook: 60, serves: 10, s: [6320, 55, 298, 5140, 1260, 108000], age: 67,
      desc: "Rich, smooth, crack-free baked cheesecake on a buttery biscuit base, with just a hint of lemon.",
      ing: ["200 g digestive biscuits, crushed", "90 g melted butter", "700 g full-fat cream cheese, at room temperature", "150 g caster sugar", "3 eggs", "200 g sour cream", "2 tbsp cornflour", "2 tsp vanilla extract", "Zest of 1 lemon"],
      steps: [
        "Heat the oven to 160 °C / 320 °F. Mix the crushed biscuits with the butter, press firmly into a lined 23 cm springform tin and chill.",
        "Beat the cream cheese and sugar on low speed until smooth. Add the eggs one at a time, then the sour cream, cornflour, vanilla and zest. Do not over-beat.",
        "Wrap the tin in foil, pour the filling over the base and place in a roasting tin. Pour hot water halfway up the sides.",
        "Bake for 55 to 60 minutes, until the edges are set and the centre still wobbles slightly.",
        "Turn off the oven and leave the cake inside with the door ajar for 1 hour. Chill in the fridge for at least 6 hours before serving.",
      ],
      tips: ["Room-temperature ingredients prevent lumps.", "The water bath and slow cooling stop the top from cracking.", "Run a warm knife around the edge before releasing the tin."],
    },
    {
      id: "apple-pie", ph: "applePie", title: "Apple Pie", diff: "Hard",
      cats: ["desserts", "baking", "vegetarian"], tags: ["apple pie", "pastry", "cinnamon", "autumn"],
      prep: 60, cook: 55, serves: 8, s: [5890, 45, 274, 4790, 1090, 96400], age: 120,
      desc: "Flaky all-butter pastry filled with tender cinnamon apples. A classic that deserves the effort.",
      ing: ["350 g plain flour", "225 g cold butter, cubed", "1 tbsp sugar", "1 tsp salt", "6 to 8 tbsp iced water", "1 kg apples (mix of Bramley and Granny Smith), sliced", "100 g sugar", "2 tbsp plain flour", "1 tsp ground cinnamon", "Juice of ½ lemon", "1 egg, beaten, for glazing"],
      steps: [
        "Rub the butter into the flour, sugar and salt until pea-sized crumbs remain. Add iced water a spoon at a time until the dough just comes together. Split in two, wrap and chill for 1 hour.",
        "Toss the apples with the sugar, flour, cinnamon and lemon juice.",
        "Heat the oven to 200 °C / 400 °F. Roll out one piece of dough and line a 23 cm pie dish. Pile in the apples.",
        "Roll out the second piece, cover the pie, crimp the edges and cut a few steam vents. Brush with beaten egg.",
        "Bake for 20 minutes, reduce to 180 °C / 350 °F and bake 35 minutes more until deep golden. Cool for at least 1 hour before slicing.",
      ],
      tips: ["Keep everything cold. Cold butter creates flaky layers.", "A mix of apple varieties gives both structure and flavour.", "Cooling lets the filling set so slices hold."],
    },
    {
      id: "avocado-toast-egg", ph: "avocadoToast", title: "Avocado Toast with Egg", diff: "Easy",
      cats: ["breakfast", "healthy", "vegetarian", "quick"], tags: ["avocado", "toast", "egg", "5 minute"],
      prep: 5, cook: 5, serves: 2, s: [2940, 26, 121, 2050, 410, 52700], age: 6,
      desc: "Creamy smashed avocado on crunchy sourdough, topped with a jammy egg and chilli flakes.",
      ing: ["2 slices sourdough", "1 ripe avocado", "2 eggs", "Juice of ½ lime", "Chilli flakes", "Flaky sea salt", "Extra virgin olive oil"],
      steps: [
        "Toast the sourdough until deeply golden.",
        "Mash the avocado with lime juice and a good pinch of salt, leaving it a little chunky.",
        "Boil the eggs for 6½ minutes, then cool in cold water and peel.",
        "Pile the avocado on the toast, top with sliced egg, chilli flakes and a drizzle of olive oil.",
      ],
      tips: ["Lime juice keeps the avocado green and adds freshness.", "Set a timer. 6½ minutes gives a jammy centre."],
    },
    {
      id: "garlic-butter-steak", ph: "steak", title: "Garlic Butter Steak", diff: "Medium",
      cats: ["beef"], tags: ["steak", "ribeye", "pan-seared", "date night"],
      prep: 10, cook: 12, serves: 2, s: [4560, 39, 192, 3610, 830, 74800], age: 20,
      desc: "A deeply seared crust, pink juicy centre and a spoonful of garlic-thyme butter to finish.",
      ing: ["2 ribeye or sirloin steaks (about 250 g each)", "2 tbsp neutral oil", "3 tbsp butter", "4 garlic cloves, smashed", "3 sprigs of thyme", "Flaky salt and black pepper"],
      steps: [
        "Take the steaks out of the fridge 30 minutes ahead. Pat very dry and season generously with salt and pepper.",
        "Heat the oil in a heavy pan until smoking. Add the steaks and sear for 3 to 4 minutes without moving until a deep crust forms.",
        "Flip, add the butter, garlic and thyme, then tilt the pan and baste for 3 minutes.",
        "Rest the steaks for 5 to 8 minutes before slicing against the grain and spooning over the pan butter.",
      ],
      tips: ["Dry meat sears, wet meat steams. Pat it very dry.", "For medium-rare, aim for 54 °C / 130 °F before resting.", "Never skip the rest, or the juices will run out."],
    },
    {
      id: "berry-smoothie-bowl", ph: "smoothieBowl", title: "Berry Smoothie Bowl", diff: "Easy",
      cats: ["healthy", "breakfast", "vegetarian", "quick"], tags: ["smoothie bowl", "berries", "granola", "vegan-friendly"],
      prep: 8, cook: 0, serves: 1, s: [2210, 18, 84, 1670, 290, 38200], age: 4,
      desc: "A thick, spoonable blend of frozen berries and banana topped with crunchy granola and fresh fruit.",
      ing: ["200 g frozen mixed berries", "1 frozen banana", "100 ml milk or plant milk", "3 tbsp Greek or coconut yoghurt", "Granola, fresh berries, sliced banana", "1 tbsp chia seeds", "1 tsp honey (optional)"],
      steps: [
        "Blend the frozen berries, banana, milk and yoghurt until thick and smooth. Use the tamper or stop and stir if it sticks.",
        "Spoon into a bowl and smooth the top.",
        "Decorate with granola, fresh berries, banana slices, chia seeds and a drizzle of honey.",
      ],
      tips: ["Use as little liquid as possible so the bowl stays thick.", "Serve right away, before it melts."],
    },
    {
      id: "fresh-berry-lemonade", ph: "lemonade", title: "Fresh Berry Lemonade", diff: "Easy",
      cats: ["drinks", "vegetarian", "quick"], tags: ["lemonade", "berries", "summer", "refreshing"],
      prep: 10, cook: 5, serves: 6, s: [1980, 14, 67, 1240, 260, 29600], age: 9,
      desc: "Sharp, sweet and ruby-coloured, made with a quick berry syrup and lots of ice.",
      ing: ["250 g strawberries or raspberries", "100 g sugar", "200 ml water", "250 ml fresh lemon juice (about 5 lemons)", "800 ml cold water or sparkling water", "Ice", "Mint leaves and lemon slices, to serve"],
      steps: [
        "Simmer the berries, sugar and 200 ml water for 5 minutes until the fruit collapses. Strain through a sieve, pressing gently.",
        "Let the syrup cool, then stir in the lemon juice.",
        "Pour into a jug, add the cold water and taste. Adjust with more syrup or lemon.",
        "Serve over ice with mint and lemon slices.",
      ],
      tips: ["Swap still water for sparkling for a fizzy version.", "The syrup keeps for a week in the fridge."],
    },
  ];

  const COMMUNITY = [
    {
      id: "tuna-pizza", by: "anis", ph: "tunaPizza", title: "Tuna Pizza", diff: "Medium",
      cats: ["pizza", "italian"], tags: ["tuna", "pizza", "red onion", "olives"],
      prep: 25, cook: 15, serves: 2, s: [2184, 31, 143, 1266, 402, 38900], age: 3,
      desc: "My Friday-night favourite. Salty tuna, sweet red onion and olives on a crisp base with plenty of melted mozzarella.",
      ing: ["300 g pizza dough", "100 g passata", "1 can (160 g) tuna, drained", "½ red onion, thinly sliced", "120 g mozzarella", "8 black olives, halved", "1 tsp dried oregano", "Olive oil"],
      steps: ["Heat your oven to its highest setting with a tray inside.", "Stretch the dough to a 28 cm round and spread with a thin layer of passata.", "Scatter the mozzarella, onion, olives and flaked tuna over the top.", "Bake for 10 to 12 minutes until the crust is golden and bubbly.", "Finish with oregano and a drizzle of olive oil."],
      tips: ["Drain the tuna really well so the pizza doesn't turn soggy.", "Add the onions raw. They soften and sweeten in the oven."],
    },
    {
      id: "creamy-garlic-pasta", by: "maria", ph: "garlicPasta", title: "Creamy Garlic Pasta", diff: "Easy",
      cats: ["pasta", "vegetarian", "quick"], tags: ["garlic", "creamy", "parmesan", "15 minutes"],
      prep: 5, cook: 15, serves: 2, s: [3410, 42, 218, 2350, 690, 61200], age: 2,
      desc: "Garlic butter, cream and Parmesan melt into a silky sauce. Ready faster than delivery.",
      ing: ["200 g fettuccine", "4 garlic cloves, minced", "2 tbsp butter", "150 ml double cream", "50 g Parmesan, grated", "Chopped parsley", "Black pepper", "Pasta water"],
      steps: ["Boil the pasta in salted water and save a cup of the water.", "Melt the butter over low heat and cook the garlic for 1 minute without browning.", "Add the cream and simmer gently for 3 minutes.", "Stir in the Parmesan, add the pasta and toss with a splash of pasta water until silky.", "Finish with parsley and a lot of black pepper."],
      tips: ["Keep the garlic pale. Browned garlic turns bitter.", "Add pasta water gradually until the sauce clings."],
    },
    {
      id: "crispy-chicken", by: "chefali", ph: "crispyChicken", title: "Crispy Chicken", diff: "Medium",
      cats: ["chicken", "quick"], tags: ["panko", "crispy", "tenders", "air fryer"],
      prep: 20, cook: 18, serves: 4, s: [4102, 57, 264, 2980, 903, 88800], age: 5,
      desc: "Panko-crusted chicken with a crunch you can hear. Baked or air-fried, with no deep-fryer needed.",
      ing: ["600 g chicken breast, cut in strips", "2 eggs", "100 g plain flour", "150 g panko breadcrumbs", "1 tsp smoked paprika", "1 tsp garlic powder", "Salt and pepper", "Oil spray"],
      steps: ["Season the chicken with salt, pepper, paprika and garlic powder.", "Set up three dishes: flour, beaten eggs, and panko.", "Coat each strip in flour, egg and then panko, pressing firmly.", "Spray with oil and bake at 220 °C / 425 °F (or air-fry at 200 °C) for 15 to 18 minutes, flipping halfway.", "Serve hot with your favourite dip."],
      tips: ["Toast the panko for 2 minutes in a dry pan first for extra golden colour.", "Use a rack so the underside stays crisp."],
    },
    {
      id: "fresh-garden-salad-cwm", by: "cookwithme", ph: "freshSalad", title: "Fresh Garden Salad", diff: "Easy",
      cats: ["healthy", "vegetarian", "quick"], tags: ["salad", "meal prep", "lemon", "chickpeas"],
      prep: 10, cook: 0, serves: 2, s: [1876, 15, 92, 1120, 254, 29700], age: 6,
      desc: "My go-to lunch: crunchy veg, chickpeas and toasted seeds with a honey-lemon dressing.",
      ing: ["2 handfuls of mixed leaves", "1 cucumber, diced", "10 cherry tomatoes, halved", "1 can chickpeas, drained", "2 tbsp sunflower seeds", "3 tbsp olive oil", "1 tbsp lemon juice", "1 tsp honey", "Salt and pepper"],
      steps: ["Toast the seeds in a dry pan for 2 minutes.", "Shake the oil, lemon, honey and seasoning in a jar.", "Combine the leaves, cucumber, tomatoes and chickpeas.", "Dress, top with the seeds and serve."],
      tips: ["Keep the dressing separate if you're meal-prepping."],
    },
    {
      id: "chocolate-cake", by: "sweettooth", ph: "chocCakeLayers", title: "Chocolate Cake", diff: "Hard",
      cats: ["desserts", "baking", "vegetarian"], tags: ["layer cake", "ganache", "birthday", "chocolate"],
      prep: 60, cook: 40, serves: 12, s: [5230, 61, 347, 4190, 1478, 101000], age: 4,
      desc: "Three tall layers of dark chocolate sponge, salted caramel and silky ganache. A show-stopper.",
      ing: ["300 g plain flour", "250 g caster sugar", "90 g cocoa powder", "2 tsp baking powder", "3 eggs", "300 ml buttermilk", "150 ml vegetable oil", "250 ml hot coffee", "300 g dark chocolate", "300 ml double cream", "150 g salted caramel"],
      steps: ["Bake three 18 cm layers using the batter of dry ingredients, eggs, buttermilk, oil and hot coffee at 175 °C / 350 °F for 25 to 30 minutes.", "Cool completely and level the tops.", "Make ganache by pouring hot cream over chopped chocolate; stir and cool until spreadable.", "Layer cake, ganache and a spoonful of caramel. Repeat.", "Cover the outside with ganache and chill for 30 minutes before slicing."],
      tips: ["Chill the layers for 20 minutes before assembling to reduce crumbs.", "Use a hot knife to slice cleanly."],
    },
    {
      id: "creamy-mushroom-pasta-lina", by: "lina", ph: "mushroomPasta2", title: "Creamy Mushroom Pasta", diff: "Easy",
      cats: ["pasta", "vegetarian", "quick"], tags: ["mushroom", "dairy-free", "oat cream", "one pan"],
      prep: 10, cook: 20, serves: 3, s: [2764, 24, 131, 1802, 342, 43800], age: 9,
      desc: "My dairy-free take: garlicky mushrooms in a rich oat-cream and miso sauce. Nobody misses the cream.",
      ing: ["300 g rigatoni", "400 g mixed mushrooms", "3 garlic cloves", "1 tbsp white miso", "200 ml oat cream", "2 tbsp olive oil", "Fresh thyme", "Salt, pepper and chilli flakes"],
      steps: ["Cook the pasta and reserve some water.", "Sear the mushrooms in olive oil until deeply golden.", "Add the garlic and thyme for 1 minute.", "Stir the miso into the oat cream and pour it into the pan. Simmer for 3 minutes.", "Toss with the pasta and a splash of the pasta water."],
      tips: ["Miso adds a savoury depth that replaces Parmesan.", "Don't wash mushrooms. Wipe them with a damp cloth."],
    },
    {
      id: "chicken-rice-foodlover", by: "foodlover", ph: "chickenRice2", title: "Chicken Rice", diff: "Medium",
      cats: ["asian", "chicken"], tags: ["one-pot", "rice", "chicken", "weeknight"],
      prep: 15, cook: 35, serves: 4, s: [2350, 27, 118, 1544, 316, 41200], age: 11,
      desc: "The one-pot version I make on busy nights. Rice soaks up all the chicken juices and spices.",
      ing: ["6 chicken drumsticks", "300 g basmati rice", "1 onion, sliced", "3 garlic cloves", "1 tsp turmeric", "1 tsp cumin", "600 ml chicken stock", "2 tbsp oil", "Lemon and fresh coriander"],
      steps: ["Brown the seasoned chicken in oil, then set aside.", "Cook the onion and garlic with the spices for 5 minutes.", "Stir in the washed rice, then the stock, and nestle the chicken on top.", "Cover and cook on low for 25 minutes. Rest 10 minutes before serving.", "Finish with lemon and coriander."],
      tips: ["Rinse the rice to keep the grains fluffy and separate.", "Don't lift the lid while it steams."],
    },
    {
      id: "homemade-burger", by: "sam", ph: "homeBurger", title: "Homemade Burger", diff: "Medium",
      cats: ["beef"], tags: ["smash burger", "cheeseburger", "burger", "homemade"],
      prep: 15, cook: 10, serves: 2, s: [3689, 48, 209, 2412, 715, 72300], age: 7,
      desc: "Smash-style: thin, lacy-edged patties, gooey cheese and a soft toasted bun.",
      ing: ["300 g beef mince (80/20)", "2 potato buns", "4 slices American cheese", "Pickles", "1 small onion, finely diced", "Mustard and ketchup", "Salt and pepper", "Butter"],
      steps: ["Roll the beef into 4 balls. Heat a cast-iron pan until smoking.", "Smash each ball flat with a spatula and season. Cook for 90 seconds until a lacy crust forms.", "Flip, add cheese and cook for 30 more seconds.", "Toast the buns in butter, then stack two patties per bun with onion, pickles and sauces."],
      tips: ["Smash hard within the first 10 seconds for the best crust.", "Cold beef, hot pan."],
    },
    {
      id: "garlic-bread-cwm", by: "cookwithme", ph: "garlicBread2", title: "Garlic Bread", diff: "Easy",
      cats: ["baking", "vegetarian", "quick"], tags: ["cheesy", "pull apart", "party food", "bread"],
      prep: 10, cook: 20, serves: 6, s: [2905, 22, 133, 1990, 604, 51400], age: 10,
      desc: "A pull-apart loaf stuffed with garlic butter and mozzarella. Comes out molten and impossible to resist.",
      ing: ["1 round crusty loaf", "100 g soft butter", "5 garlic cloves, minced", "150 g mozzarella, grated", "Parsley", "Pinch of salt"],
      steps: ["Heat the oven to 190 °C / 375 °F. Score the loaf in a grid, cutting almost to the base.", "Mix the butter, garlic, parsley and salt and spread into every cut.", "Push cheese between the cuts, wrap in foil and bake for 15 minutes.", "Unwrap and bake for 5 more minutes until bubbling."],
      tips: ["Slightly stale bread works best.", "Serve while hot and gooey."],
    },
    {
      id: "shakshuka", by: "anis", ph: "shakshuka", title: "Shakshuka", diff: "Easy",
      cats: ["breakfast", "vegetarian", "healthy"], tags: ["eggs", "tomato", "brunch", "spicy"],
      prep: 10, cook: 20, serves: 3, s: [1980, 17, 96, 1310, 240, 33400], age: 14,
      desc: "Eggs poached in a spicy, smoky tomato and pepper sauce. My brunch classic.",
      ing: ["1 onion, diced", "1 red pepper, diced", "3 garlic cloves", "1 tsp cumin", "1 tsp smoked paprika", "1 can (400 g) chopped tomatoes", "6 eggs", "Feta, coriander", "Olive oil, salt"],
      steps: ["Soften the onion and pepper in olive oil for 8 minutes.", "Add garlic and spices for 1 minute, then the tomatoes. Simmer for 10 minutes.", "Make 6 wells in the sauce and crack in the eggs. Cover and cook for 5 to 6 minutes.", "Top with feta and coriander and serve with bread."],
      tips: ["Cover the pan so the tops of the eggs set with steam."],
    },
    {
      id: "quick-veggie-ramen", by: "anis", ph: "ramen", title: "Quick Veggie Ramen", diff: "Medium",
      cats: ["asian", "vegetarian", "quick"], tags: ["ramen", "noodles", "miso", "soup"],
      prep: 10, cook: 20, serves: 2, s: [1544, 20, 78, 1105, 190, 27900], age: 16,
      desc: "A warming miso-ginger broth with springy noodles, mushrooms, greens and a soft egg.",
      ing: ["2 portions ramen noodles", "800 ml vegetable stock", "2 tbsp white miso", "1 tbsp soy sauce", "1 thumb ginger, grated", "150 g shiitake mushrooms", "2 pak choi", "2 soft-boiled eggs", "Spring onion, sesame oil"],
      steps: ["Simmer the stock with ginger for 10 minutes. Stir in the miso and soy off the heat.", "Sear the mushrooms in a little oil.", "Cook the noodles and pak choi according to the packet.", "Assemble noodles in bowls, ladle over broth and top with mushrooms, egg and spring onion."],
      tips: ["Don't boil miso. It loses its flavour and aroma."],
    },
    {
      id: "mango-lassi", by: "foodlover", ph: "mangoLassi", title: "Mango Lassi", diff: "Easy",
      cats: ["drinks", "vegetarian", "quick"], tags: ["mango", "lassi", "yoghurt", "summer"],
      prep: 5, cook: 0, serves: 2, s: [1233, 9, 54, 842, 167, 19800], age: 12,
      desc: "Sunshine in a glass: ripe mango, cold yoghurt and a pinch of cardamom.",
      ing: ["2 ripe mangoes (or 300 g frozen)", "250 g plain yoghurt", "150 ml cold milk", "1 tbsp honey", "Pinch of ground cardamom", "Ice"],
      steps: ["Peel and chop the mangoes.", "Blend everything until smooth and frothy.", "Taste, adjust the sweetness and serve cold."],
      tips: ["Use frozen mango and skip the ice for a thicker drink."],
    },
    {
      id: "peanut-butter-cookies", by: "sweettooth", ph: "cookies", title: "Peanut Butter Cookies", diff: "Easy",
      cats: ["desserts", "baking", "vegetarian"], tags: ["cookies", "peanut butter", "3 ingredient", "chewy"],
      prep: 10, cook: 12, serves: 12, s: [2650, 19, 121, 1877, 512, 39600], age: 19,
      desc: "Soft, chewy and made with just a handful of ingredients. Dangerous to keep in the house.",
      ing: ["250 g peanut butter", "150 g brown sugar", "1 egg", "1 tsp vanilla", "½ tsp baking soda", "Pinch of sea salt"],
      steps: ["Heat the oven to 175 °C / 350 °F and line a tray.", "Mix everything until a soft dough forms.", "Roll into balls, place on the tray and press with a fork.", "Bake for 10 to 12 minutes. They'll firm up as they cool."],
      tips: ["Take them out when they still look slightly underdone for chewy centres."],
    },
  ];

  /* ------------------------------------------------------------------ */
  /* Reels (short vertical videos)                                       */
  /* ------------------------------------------------------------------ */
  const REELS = [
    { id: "creamy-pasta-3min", by: "maria", ph: "garlicPasta", title: "3 Minute Creamy Pasta", cats: ["pasta"], dur: 34, cap: "Cream, garlic, parmesan. That's the whole sauce. Save this for the nights you don't want to think.", tags: ["pasta", "quickmeals", "creamy"], recipe: "creamy-garlic-pasta", s: [12400, 96, 481, 5210, 1820, 240000], age: 1 },
    { id: "perfect-crispy-chicken", by: "chefali", ph: "friedChicken", title: "Perfect Crispy Chicken", cats: ["chicken"], dur: 41, cap: "The double-dredge trick that changes everything. Listen to that crunch.", tags: ["crispychicken", "fried", "chefali"], recipe: "crispy-chicken", s: [18700, 130, 742, 8120, 3020, 410000], age: 2 },
    { id: "how-i-make-pizza", by: "anis", ph: "reelPizza", title: "How I Make Pizza", cats: ["pizza"], dur: 58, cap: "From dough ball to bubbling crust, my Friday ritual in under a minute.", tags: ["pizza", "homemade", "pizzanight"], recipe: "tuna-pizza", s: [9800, 71, 356, 4470, 1250, 178000], age: 3 },
    { id: "easy-cake-decoration", by: "sweettooth", ph: "reelCake", title: "Easy Cake Decoration", cats: ["desserts"], dur: 27, cap: "No piping bag? No problem. Three easy tricks to make any cake look bakery-made.", tags: ["cake", "decorating", "baking"], recipe: "chocolate-cake", s: [14300, 88, 590, 6230, 2140, 322000], age: 4 },
    { id: "breakfast-in-5", by: "lina", ph: "reelBreakfast", title: "Breakfast in 5 Minutes", cats: ["breakfast"], dur: 33, cap: "Running late? These 5-minute breakfasts have you covered.", tags: ["breakfast", "quick", "morningroutine"], recipe: "shakshuka", s: [7650, 54, 268, 3300, 890, 132000], age: 2 },
    { id: "smash-burger-secrets", by: "sam", ph: "reelSmash", title: "Smash Burger Secrets", cats: ["beef"], dur: 29, cap: "Hot pan, cold beef, one confident smash. Crispy lace edges for days.", tags: ["smashburger", "burger", "streetfood"], recipe: "homemade-burger", s: [16100, 112, 655, 7240, 2600, 365000], age: 5 },
    { id: "pull-apart-garlic-bread", by: "cookwithme", ph: "garlicBread2", title: "Pull-Apart Garlic Bread", cats: ["baking"], dur: 24, cap: "Cheese pull alert. This is the easiest party snack on the internet.", tags: ["garlicbread", "cheesy", "partyfood"], recipe: "garlic-bread-cwm", s: [11200, 63, 402, 5100, 1980, 214000], age: 6 },
    { id: "fluffy-pancake-stack", by: "lina", ph: "pancakes", title: "Fluffy Pancake Stack", cats: ["breakfast"], dur: 31, cap: "Rest the batter, keep the heat low, don't press. That's it.", tags: ["pancakes", "brunch", "fluffy"], s: [8540, 47, 311, 3980, 1010, 158000], age: 7 },
    { id: "salad-prep-hack", by: "cookwithme", ph: "reelSalad", title: "Crunchy Salad Prep Hack", cats: ["healthy"], dur: 36, cap: "Five days of lunches in one jar system, and nothing goes soggy.", tags: ["mealprep", "salad", "healthy"], recipe: "fresh-garden-salad-cwm", s: [6120, 39, 205, 4390, 1320, 112000], age: 8 },
    { id: "molten-lava-cake", by: "sweettooth", ph: "reelLava", title: "Molten Chocolate Lava Cake", cats: ["desserts"], dur: 44, cap: "Six ingredients. Twelve minutes. One very dramatic spoon-through.", tags: ["lavacake", "chocolate", "dessert"], s: [19800, 140, 802, 9330, 3410, 452000], age: 9 },
    { id: "street-style-tacos", by: "sam", ph: "reelTacos", title: "Street-Style Tacos", cats: ["mexican"], dur: 39, cap: "Charred tortillas, juicy filling, lime. Taco Tuesday sorted.", tags: ["tacos", "mexican", "streetfood"], s: [10300, 78, 371, 4820, 1450, 201000], age: 10 },
    { id: "mango-lassi-60s", by: "foodlover", ph: "mangoLassi", title: "Mango Lassi in 60 Seconds", cats: ["drinks"], dur: 47, cap: "The coolest way to beat the heat. Blend, pour, sip.", tags: ["mango", "lassi", "drinks"], recipe: "mango-lassi", s: [5890, 33, 190, 2670, 720, 97000], age: 11 },
  ];

  /* ------------------------------------------------------------------ */
  /* Long videos                                                         */
  /* ------------------------------------------------------------------ */
  const VIDEOS = [
    { id: "complete-pasta-tutorial", by: "maria", ph: "garlicPasta", title: "Complete Pasta Tutorial: From Dough to Perfect Sauce", cats: ["pasta", "italian"], dur: 1458, s: [15400, 210, 1280, 7120, 2210, 184000], age: 12,
      desc: "Everything I know about pasta in one video: how to make fresh dough by hand, roll and cut shapes, and pair each shape with the right sauce. We finish with three classic sauces you can make in the time it takes to boil the water.\n\nChapters: Dough basics, Rolling and cutting, Tomato sauce, Cacio e pepe, Creamy garlic sauce, Common mistakes.",
      tags: ["pasta", "tutorial", "italian", "homemade"], links: [{ label: "Creamy Garlic Pasta recipe", url: "#/recipe/creamy-garlic-pasta" }, { label: "Classic Spaghetti recipe", url: "#/recipe/classic-spaghetti" }] },
    { id: "how-i-make-crispy-chicken", by: "chefali", ph: "crispyChicken", title: "How I Make Crispy Chicken (Restaurant Method)", cats: ["chicken"], dur: 1122, s: [22600, 260, 1910, 10440, 3800, 356000], age: 20,
      desc: "The full restaurant method: brining, seasoning, the double dredge, oil temperature control and how to keep chicken crunchy for an hour. Includes my crispy tenders, wings and a spicy glaze.",
      tags: ["chicken", "crispy", "technique", "chef"], links: [{ label: "Crispy Chicken recipe", url: "#/recipe/crispy-chicken" }, { label: "Korean Crispy Chicken", url: "#/recipe/korean-crispy-chicken" }] },
    { id: "weekend-family-cooking", by: "anis", ph: "vidFamily", title: "Weekend Family Cooking: A Full Sunday Feast", cats: ["italian", "beef"], dur: 3130, s: [8100, 90, 764, 3320, 940, 97500], age: 6,
      desc: "Join me and my family for a slow Sunday: fresh focaccia, a big pot of ragù, roasted vegetables and a lemon tart. Fifty minutes of real, unhurried home cooking.\n\nBring a cup of tea and cook along.",
      tags: ["family", "sundaycooking", "feast", "homecooking"], links: [{ label: "Classic Lasagne recipe", url: "#/recipe/classic-lasagne" }] },
    { id: "pizza-night-dough-to-oven", by: "anis", ph: "vidPizza", title: "Pizza Night: Dough, Sauce & Toppings from Scratch", cats: ["pizza", "italian"], dur: 1865, s: [12900, 140, 1042, 6110, 1720, 221000], age: 15,
      desc: "A complete pizza night: the dough I've used for years, a 2-minute tomato sauce, five topping combinations (including my tuna pizza) and tips for getting a home oven hot enough.",
      tags: ["pizza", "dough", "pizzanight"], links: [{ label: "Classic Italian Pizza recipe", url: "#/recipe/classic-italian-pizza" }, { label: "Tuna Pizza recipe", url: "#/recipe/tuna-pizza" }] },
    { id: "chocolate-cake-masterclass", by: "sweettooth", ph: "vidCake", title: "Ultimate Chocolate Cake Masterclass", cats: ["desserts", "baking"], dur: 2607, s: [19700, 190, 2210, 9840, 3020, 312000], age: 25,
      desc: "From perfectly level layers to a mirror-shiny ganache and clean slices, this masterclass covers every step of a bakery-quality chocolate cake. Includes the fix for sunken and dry sponges.",
      tags: ["cake", "masterclass", "baking", "chocolate"], links: [{ label: "Chocolate Cake recipe", url: "#/recipe/chocolate-cake" }, { label: "Simple Chocolate Cake", url: "#/recipe/simple-chocolate-cake" }] },
    { id: "meal-prep-whole-week", by: "cookwithme", ph: "vidMealPrep", title: "Meal Prep for the Whole Week in 90 Minutes", cats: ["healthy", "quick"], dur: 1730, s: [9420, 75, 893, 8330, 2510, 143000], age: 9,
      desc: "Five lunches and four dinners prepped in one session: grain bowls, tray-bake chicken, two sauces and a big-batch soup. Full shopping list in the description links.",
      tags: ["mealprep", "healthy", "weeklyplan"], links: [{ label: "Fresh Garden Salad recipe", url: "#/recipe/fresh-garden-salad-cwm" }] },
    { id: "taco-night-at-home", by: "sam", ph: "vidTacos", title: "Taco Night at Home: 3 Fillings, 2 Salsas", cats: ["mexican", "beef"], dur: 920, s: [7300, 66, 588, 3210, 890, 88400], age: 17,
      desc: "Beef, chicken tinga and roasted veg tacos with a smoky salsa roja and a fresh salsa verde. Everything on the table in 15 minutes of screen time (and about 40 in the kitchen).",
      tags: ["tacos", "mexican", "salsa"], links: [{ label: "Beef Tacos recipe", url: "#/recipe/beef-tacos" }] },
    { id: "ten-breakfasts-ten-minutes", by: "lina", ph: "vidBreakfast", title: "10 Breakfasts Under 10 Minutes", cats: ["breakfast", "quick"], dur: 724, s: [10700, 92, 736, 6720, 2040, 199000], age: 11,
      desc: "Ten fast breakfasts for real mornings: savoury and sweet, hot and cold, and a few you can prep the night before.",
      tags: ["breakfast", "quick", "morning"], links: [{ label: "Avocado Toast with Egg", url: "#/recipe/avocado-toast-egg" }, { label: "Fluffy Pancakes", url: "#/recipe/fluffy-pancakes" }] },
  ];

  /* ------------------------------------------------------------------ */
  /* Normalise into the shapes the app expects                           */
  /* ------------------------------------------------------------------ */
  const stat = (o) => {
    const [likes, dislikes, comments, saves, shares, views] = o.s || [0, 0, 0, 0, 0, 0];
    return { likes, dislikes, comments, saves, shares, views };
  };
  const RECIPES = [
    ...FIXED.map((r) => ({ type: "recipe", source: "fixed", author: OFFICIAL, ...r, ...stat(r) })),
    ...COMMUNITY.map((r) => ({ type: "recipe", source: "community", author: r.by, ...r, ...stat(r) })),
  ];
  const REELS_N = REELS.map((r) => ({ type: "reel", author: r.by, ...r, ...stat(r) }));
  const VIDEOS_N = VIDEOS.map((v) => ({ type: "video", author: v.by, ...v, ...stat(v) }));

  window.SC_DATA = {
    PHOTO, photoUrl, CATEGORIES, USERS, OFFICIAL,
    RECIPES, REELS: REELS_N, VIDEOS: VIDEOS_N,
    SEED_COMMENTS: [
      "This looks incredible! Making it tonight.",
      "Just made this and my whole family loved it.",
      "Any substitute you'd recommend for the parmesan?",
      "Saved for the weekend. Thank you for sharing!",
      "The texture is unreal. Followed every step and it worked.",
      "Tried it with a little less salt and it was still perfect.",
      "Which pan do you use? Mine never browns like that.",
      "Instructions were super clear, even for a beginner like me.",
      "Made this for date night and got so many compliments.",
      "Okay, this is officially on my weekly rotation now.",
      "Followed you just for this. More please!",
      "My kids asked for seconds, which never happens.",
    ],
  };
})();
