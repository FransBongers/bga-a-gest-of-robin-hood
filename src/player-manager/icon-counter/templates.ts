const tplIconCounter = ({
  icon,
  iconCounterId,
  value,
  extraIconClasses,
  dataAttributes,
}: {
  icon?: string;
  iconCounterId: string;
  value: number;
  extraIconClasses?: string;
  dataAttributes?: { key: string; value: string }[];
}) => `
  <div id="${iconCounterId}" class="gest_icon_counter_container${
  value === 0 ? ' gest_none' : ''
}">
    <span id="${iconCounterId}_counter" class="gest_counter"></span>
    <div id="${iconCounterId}_icon" style="position: relative;" class="gest_icon${
  extraIconClasses ? ` ${extraIconClasses}` : ''
}" ${icon ? `data-icon="${icon}"` : ''}${(dataAttributes || [])
  .map((dataAttribute) => ` ${dataAttribute.key}="${dataAttribute.value}"`)
  .join('')}></div>
  </div>`;
