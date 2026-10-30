
const API = "api.php";
const REF = { pro: 50, carb: 275, fat: 78 };
const $ = id => document.getElementById(id);
const MEALS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const KEY = "nutritrack-data";

let foods = [];
let logs = [];
let db = { goal: 2000 };

try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (saved.goal) db.goal = saved.goal;
} catch (e) { }

const saveGoal = () => {
    localStorage.setItem(KEY, JSON.stringify({ goal: db.goal }));
};

const iso = d =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10);

const r1 = n => Math.round(Number(n) * 10) / 10;

let current = iso(new Date());

async function request(action, method = "GET", data = null, extra = "") {
    const options = { method, headers: {} };

    if (data !== null) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const response = await fetch(
        `${API}?action=${action}${extra}`,
        options
    );

    const result = await response.json();

    if (!response.ok || result.success === false) {
        throw new Error(result.message || "Request failed.");
    }

    return result;
}

function showError(message) {
    $("preview").textContent = message;
}

function findFood(name) {
    return foods.find(
        f => f.name.toLowerCase() === name.trim().toLowerCase()
    );
}

function totals(entries) {
    const t = { cal: 0, pro: 0, carb: 0, fat: 0 };

    entries.forEach(e => {
        ["cal", "pro", "carb", "fat"].forEach(k => {
            t[k] += Number(e[k] || 0) * Number(e.servings || 0);
        });
    });

    return t;
}

function feedbackFor(t, entries) {
    const g = Number(db.goal);
    const out = [];

    if (!entries.length) {
        return [["info", "Nothing logged yet. Add your first meal to see feedback."]];
    }

    const c = t.cal / g * 100;
    const p = t.pro / REF.pro * 100;

    if (c > 110) {
        out.push(["warn", "You are over your calorie goal."]);
    } else if (c >= 90) {
        out.push(["ok", "You are close to your calorie goal for today."]);
    } else {
        out.push(["info", "You have about " + Math.round(g - t.cal) + " kcal left for today."]);
    }

    if (p < 60) {
        out.push(["warn", "Protein is below the daily reference."]);
    } else if (p >= 100) {
        out.push(["ok", "You reached the protein reference."]);
    }

    if (t.fat / REF.fat > 1) {
        out.push(["warn", "Fat is above the daily reference."]);
    }

    if (t.carb / REF.carb > 1.1) {
        out.push(["warn", "Carbohydrates are above the daily reference."]);
    }

    if (!entries.some(e => e.meal === "Breakfast")) {
        out.push(["info", "No breakfast logged for this day."]);
    }

    return out;
}

function render() {
    const entries = logs;
    const t = totals(entries);
    const g = Number(db.goal);

    $("goalInput").value = g;
    $("viewDate").value = current;

    $("dayName").textContent =
        new Date(current + "T00:00:00").toLocaleDateString("en-PH", {
            weekday: "long",
            month: "short",
            day: "numeric"
        });

    const pct = Math.round(t.cal / g * 100);

    $("progressBar").style.width = Math.min(pct, 100) + "%";
    $("progressBar").classList.toggle("over", pct > 100);
    $("meter").setAttribute("aria-valuenow", Math.min(pct, 100));

    $("goalMsg").textContent =
        t.cal <= g
            ? Math.round(g - t.cal).toLocaleString() + " kcal left to reach your goal."
            : Math.round(t.cal - g).toLocaleString() + " kcal over your goal.";

    $("calTotal").textContent = Math.round(t.cal);
    $("calPct").textContent = pct + "%";

    ["pro", "carb", "fat"].forEach(k => {
        $(k + "Total").textContent = r1(t[k]);

        const p = Math.round(t[k] / REF[k] * 100);
        $(k + "Pct").textContent = p + "%";
        $(k + "Pct").parentElement.classList.toggle("high", p > 110);
    });

    const fb = $("feedback");
    fb.textContent = "";

    feedbackFor(t, entries).forEach(([cls, msg]) => {
        const li = document.createElement("li");
        li.className = cls === "ok" ? "" : cls;
        li.textContent = msg;
        fb.appendChild(li);
    });

    renderLog(entries);
    renderWeek();
}

function renderLog(entries) {
    const box = $("mealLog");
    box.textContent = "";

    if (!entries.length) {
        const p = document.createElement("p");
        p.className = "note";
        p.textContent = "No meals yet. Use Add a meal above.";
        box.appendChild(p);
        return;
    }

    MEALS.forEach(meal => {
        const list = entries.filter(e => e.meal === meal);
        if (!list.length) return;

        const group = document.createElement("div");
        group.className = "meal-group";

        const heading = document.createElement("h3");
        heading.append(meal + " ");

        const total = document.createElement("span");
        total.textContent = Math.round(totals(list).cal) + " kcal";
        heading.appendChild(total);
        group.appendChild(heading);

        list.forEach(e => {
            const row = document.createElement("div");
            row.className = "entry";

            const info = document.createElement("div");
            info.textContent = e.name;

            const small = document.createElement("small");
            small.textContent =
                e.servings + " × " + e.serving +
                " · " + Math.round(e.cal * e.servings) + " kcal" +
                " · P " + r1(e.pro * e.servings) + " g" +
                " · C " + r1(e.carb * e.servings) + " g" +
                " · F " + r1(e.fat * e.servings) + " g";

            info.appendChild(small);

            const del = document.createElement("button");
            del.type = "button";
            del.textContent = "Remove";
            del.setAttribute("aria-label", "Remove " + e.name);

            del.onclick = async () => {
                del.disabled = true;

                try {
                    await request("delete_meal", "POST", {
                        id: e.id
                    });

                    await loadMeals();
                    showError("");
                } catch (error) {
                    del.disabled = false;
                    showError("Unable to remove meal: " + error.message);
                }
            };

            row.append(info, del);
            group.appendChild(row);
        });

        box.appendChild(group);
    });
}

async function renderWeek() {
    const plot = $("weekPlot");
    plot.textContent = "";

    const days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(iso(d));
    }

    let values;

    try {
        values = await Promise.all(days.map(async date => {
            const result = await request(
                "get_meals",
                "GET",
                null,
                "&date=" + encodeURIComponent(date)
            );

            return (result.meals || []).reduce(
                (sum, e) => sum + Number(e.cal) * Number(e.servings),
                0
            );
        }));
    } catch (error) {
        plot.textContent = "Unable to load weekly data.";
        return;
    }

    const scale = Math.max(Number(db.goal) * 1.3, ...values, 1);
    const H = 136;

    days.forEach((date, i) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "bar" + (date === current ? " sel" : "");
        button.setAttribute(
            "aria-label",
            date + ": " + Math.round(values[i]) + " kcal"
        );

        const bar = document.createElement("i");
        bar.style.height = (values[i] / scale * 100) + "%";

        const label = document.createElement("span");
        label.textContent = new Date(date + "T00:00:00")
            .toLocaleDateString("en-PH", { weekday: "short" });

        button.append(bar, label);

        button.onclick = async () => {
            current = date;
            await loadMeals();
        };

        plot.appendChild(button);
    });

    const line = document.createElement("div");
    line.className = "goal-line";
    line.style.bottom = (24 + Number(db.goal) / scale * H) + "px";
    plot.appendChild(line);
}

function fillList() {
    const dl = $("foodList");
    dl.textContent = "";

    foods.forEach(f => {
        const option = document.createElement("option");
        option.value = f.name;
        option.label = f.serving;
        dl.appendChild(option);
    });
}

function preview() {
    const food = findFood($("foodSearch").value);
    const servings = parseFloat($("servings").value) || 0;

    $("preview").textContent = food
        ? food.serving + " per serving: " +
        Math.round(food.cal * servings) + " kcal, protein " +
        r1(food.pro * servings) + " g, carbs " +
        r1(food.carb * servings) + " g, fat " +
        r1(food.fat * servings) + " g"
        : "";
}

async function loadFoods() {
    const result = await request("get_foods");
    foods = result.foods || [];
    fillList();
}

async function loadMeals() {
    try {
        const result = await request(
            "get_meals",
            "GET",
            null,
            "&date=" + encodeURIComponent(current)
        );

        logs = result.meals || [];
        render();
    } catch (error) {
        showError("Unable to load meals. Check your API connection.");
    }
}

$("logForm").onsubmit = async e => {
    e.preventDefault();

    const food = findFood($("foodSearch").value);
    const servings = parseFloat($("servings").value);

    if (!food) {
        showError("Food not found. Please select a food from the list.");
        return;
    }

    if (!Number.isFinite(servings) || servings <= 0) {
        showError("Please enter a valid number of servings.");
        return;
    }

    const button = e.submitter;
    if (button) button.disabled = true;

    try {
        await request("add_meal", "POST", {
            meal: $("mealType").value,
            foodId: food.id,
            servings,
            date: current
        });

        $("foodSearch").value = "";
        $("servings").value = 1;
        showError("");

        await loadMeals();
    } catch (error) {
        showError("Unable to save meal: " + error.message);
    } finally {
        if (button) button.disabled = false;
    }
};

$("customForm").onsubmit = async e => {
    e.preventDefault();

    const name = $("cName").value.trim();

    if (foods.some(f => f.name.toLowerCase() === name.toLowerCase())) {
        showError("This food is already in the list.");
        return;
    }

    const data = {
        name,
        serving: $("cServing").value.trim() || "1 serving",
        cal: Number($("cCal").value),
        pro: Number($("cPro").value),
        carb: Number($("cCarb").value),
        fat: Number($("cFat").value)
    };

    try {
        await request("add_food", "POST", data);
        await loadFoods();

        e.target.reset();
        showError("Food saved to the database. You can now search for it.");
    } catch (error) {
        showError("Unable to save food: " + error.message);
    }
};

$("goalInput").onchange = () => {
    const value = Number($("goalInput").value);

    if (value >= 500 && value <= 10000) {
        db.goal = value;
        saveGoal();
    }

    render();
};

$("viewDate").onchange = async () => {
    if ($("viewDate").value) {
        current = $("viewDate").value;
        await loadMeals();
    }
};

$("foodSearch").oninput = preview;
$("servings").oninput = preview;

async function init() {
    $("mealLog").textContent = "Loading meals...";
    $("foodList").textContent = "";

    try {
        await loadFoods();
        await loadMeals();
    } catch (error) {
        showError(
            "Cannot connect to the database. Check that Apache and MySQL are running."
        );
        $("mealLog").textContent = "Unable to load NutriTrack data.";
    }
}

init();
