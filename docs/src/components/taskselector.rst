Task Selector
==================

This component is used to select a task from a list of tasks. It displays a list of tasks and allows the user to select one by clicking on it. The selected task is then passed to the parent component as a prop.

## Props

- `tasks`: An array of tasks to display in the selector.
- `selectedTask`: The currently selected task.
- `onTaskSelect`: A function to call when a task is selected.

## Usage

```js
import TaskSelector from './TaskSelector';

const tasks = [
  { id: 1, name: 'Task 1' },
```
