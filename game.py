import random
import json

def place_food(state_json):
    """
    Place a food item on a random empty cell.
    state_json: JSON string representing the game state.
    Returns a JSON string with updated food position.
    """
    state = json.loads(state_json)
    grid_size = state['grid_size']
    snake = state['snake']
    # Create a set of all possible positions
    all_positions = set()
    for y in range(grid_size):
        for x in range(grid_size):
            all_positions.add((x, y))
    # Remove positions occupied by the snake
    for segment in snake:
        pos = (segment['x'], segment['y'])
        if pos in all_positions:
            all_positions.remove(pos)
    # Convert remaining positions to a list of dicts
    empty_cells = [{'x': x, 'y': y} for (x, y) in all_positions]
    # Place food at a random empty cell
    if empty_cells:
        state['food'] = random.choice(empty_cells)
    else:
        state['food'] = None
    return json.dumps(state)

def step(state_json):
    """
    Advance the game by one step: move the snake, check for collisions, and handle food.
    state_json: JSON string representing the game state.
    Returns a JSON string with the updated state.
    """
    state = json.loads(state_json)
    if state.get('game_over', False):
        return json.dumps(state)
    direction = state['dir']
    snake = list(state['snake'])
    # Calculate new head position
    head = {
        'x': snake[0]['x'] + direction['x'],
        'y': snake[0]['y'] + direction['y']
    }
    grid_size = state['grid_size']
    # Check wall collision
    if head['x'] < 0 or head['x'] >= grid_size or head['y'] < 0 or head['y'] >= grid_size:
        state['game_over'] = True
        return json.dumps(state)
        
    # Check self collision
    for segment in snake:
        if segment['x'] == head['x'] and segment['y'] == head['y']:
            state['game_over'] = True
            return json.dumps(state)

    # Move snake
    snake.insert(0, head)  # Add new head
    # Check for food
    food = state.get('food')
    if food and head['x'] == food['x'] and head['y'] == food['y']:
        # Eat food and place new one
        # First, update the state with the new snake
        state['snake'] = snake
        # Then, place new food
        state = json.loads(place_food(json.dumps(state)))
    else:
        snake.pop()  # Remove tail if no food eaten
        state['snake'] = snake
    return json.dumps(state) 