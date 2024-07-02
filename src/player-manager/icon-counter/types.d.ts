interface IconCounterConfig {
  icon?: string;
  iconCounterId: string;
  extraIconClasses?: string; 
  containerId: string;
  initialValue: number;
  insert?: 'beforeend' | 'afterbegin';
  dataAttributes?: { key: string; value: string }[];
}