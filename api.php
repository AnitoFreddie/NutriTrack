
<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

function respond($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    // GET FOODS
    if ($method === 'GET' && $action === 'get_foods') {
        $stmt = $pdo->query(
            "SELECT * FROM foods ORDER BY name ASC"
        );

        $foods = array_map(function ($f) {
            return [
                'id' => (int)$f['id'],
                'name' => $f['name'],
                'serving' => $f['serving_size'],
                'cal' => (float)$f['calories'],
                'pro' => (float)$f['protein'],
                'carb' => (float)$f['carbohydrates'],
                'fat' => (float)$f['fat']
            ];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));

        respond(['success' => true, 'foods' => $foods]);
    }

    // ADD FOOD
    if ($method === 'POST' && $action === 'add_food') {
        $data = json_decode(file_get_contents('php://input'), true);

        if (
            !is_array($data) ||
            trim($data['name'] ?? '') === '' ||
            !isset($data['cal'], $data['pro'], $data['carb'], $data['fat']) ||
            !is_numeric($data['cal']) ||
            !is_numeric($data['pro']) ||
            !is_numeric($data['carb']) ||
            !is_numeric($data['fat']) ||
            min((float)$data['cal'], (float)$data['pro'],
                (float)$data['carb'], (float)$data['fat']) < 0
        ) {
            respond(['success' => false, 'message' => 'Invalid food data.'], 400);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO foods
            (name, serving_size, calories, protein, carbohydrates, fat)
            VALUES (?, ?, ?, ?, ?, ?)"
        );

        $stmt->execute([
            trim($data['name']),
            $data['serving'] ?? '1 serving',
            $data['cal'],
            $data['pro'],
            $data['carb'],
            $data['fat']
        ]);

        respond([
            'success' => true,
            'id' => (int)$pdo->lastInsertId()
        ]);
    }

    // GET MEALS FOR A DATE
    if ($method === 'GET' && $action === 'get_meals') {
        $date = $_GET['date'] ?? date('Y-m-d');

        $parsed = DateTime::createFromFormat('!Y-m-d', $date);
        if (!$parsed || $parsed->format('Y-m-d') !== $date) {
            respond(['success' => false, 'message' => 'Invalid date.'], 400);
        }

        $stmt = $pdo->prepare(
            "SELECT ml.id, ml.meal_type, ml.food_id, ml.servings,
                    ml.meal_date, f.name, f.serving_size,
                    f.calories, f.protein, f.carbohydrates, f.fat
             FROM meal_logs ml
             JOIN foods f ON f.id = ml.food_id
             WHERE ml.meal_date = ?
             ORDER BY ml.id DESC"
        );

        $stmt->execute([$date]);
        $meals = array_map(function ($m) {
            return [
                'id' => (int)$m['id'],
                'meal' => $m['meal_type'],
                'foodId' => (int)$m['food_id'],
                'name' => $m['name'],
                'serving' => $m['serving_size'],
                'cal' => (float)$m['calories'],
                'pro' => (float)$m['protein'],
                'carb' => (float)$m['carbohydrates'],
                'fat' => (float)$m['fat'],
                'servings' => (float)$m['servings'],
                'date' => $m['meal_date']
            ];
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));

        respond(['success' => true, 'meals' => $meals]);
    }

    // ADD MEAL
    if ($method === 'POST' && $action === 'add_meal') {
        $data = json_decode(file_get_contents('php://input'), true);
        $types = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

        if (
            !is_array($data) ||
            !in_array($data['meal'] ?? '', $types, true) ||
            !isset($data['foodId'], $data['servings']) ||
            !filter_var($data['foodId'], FILTER_VALIDATE_INT) ||
            (int)$data['foodId'] < 1 ||
            !is_numeric($data['servings']) ||
            (float)$data['servings'] <= 0 ||
            (float)$data['servings'] > 999.99
        ) {
            respond(['success' => false, 'message' => 'Invalid meal data.'], 400);
        }

        $date = $data['date'] ?? date('Y-m-d');
        $parsed = DateTime::createFromFormat('!Y-m-d', $date);

        if (!$parsed || $parsed->format('Y-m-d') !== $date) {
            respond(['success' => false, 'message' => 'Invalid date.'], 400);
        }

        $stmt = $pdo->prepare(
            "INSERT INTO meal_logs (meal_type, food_id, servings, meal_date)
             VALUES (?, ?, ?, ?)"
        );

        $stmt->execute([
            $data['meal'],
            (int)$data['foodId'],
            (float)$data['servings'],
            $date
        ]);

        respond([
            'success' => true,
            'id' => (int)$pdo->lastInsertId()
        ]);
    }

    // DELETE MEAL
    if ($method === 'POST' && $action === 'delete_meal') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);

        if (!$id || $id < 1) {
            respond(['success' => false, 'message' => 'Invalid meal ID.'], 400);
        }

        $stmt = $pdo->prepare("DELETE FROM meal_logs WHERE id = ?");
        $stmt->execute([$id]);

        respond([
            'success' => true,
            'deleted' => $stmt->rowCount()
        ]);
    }

    respond([
        'success' => false,
        'message' => 'Unknown action or unsupported method.'
    ], 400);

} catch (PDOException $e) {
    respond([
        'success' => false,
        'message' => 'Database operation failed. Check your database tables.'
    ], 500);
}
?>
