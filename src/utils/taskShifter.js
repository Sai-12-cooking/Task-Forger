import { Q_NOT_URGENT_IMPORTANT, Q_URGENT_IMPORTANT, Q_NOT_URGENT_NOT_IMPORTANT, Q_URGENT_NOT_IMPORTANT } from '../constants';

/**
 * Shifts tasks from Not Urgent to Urgent if their time limit has been exceeded.
 */
export const shiftTasks = (tasks) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  let hasChanges = false;
  
  const updatedTasks = tasks.map(task => {
    // Only process incomplete tasks with a due date
    if (!task.completed && task.dueDateSeconds) {
      const timeRemaining = task.dueDateSeconds - currentTimestamp;

      // Important tasks jump to Urgent 48 hours (172800 secs) early, to give you plenty of warning
      if (task.category === Q_NOT_URGENT_IMPORTANT && timeRemaining <= 172800) {
        hasChanges = true;
        return { ...task, category: Q_URGENT_IMPORTANT, shifted: true };
      }
      
      // Unimportant tasks only jump to Urgent a bit later (24 hours = 86400 secs)
      if (task.category === Q_NOT_URGENT_NOT_IMPORTANT && timeRemaining <= 86400) {
        hasChanges = true;
        return { ...task, category: Q_URGENT_NOT_IMPORTANT, shifted: true };
      }
    }
    return task;
  });

  return { updatedTasks, hasChanges };
};
