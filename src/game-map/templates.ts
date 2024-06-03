const getRevealedText = (type: string): string => {
  switch (type) {
    case CAMP:
      return 'C';
    case MERRY_MEN:
      return 'M';
    case ROBIN_HOOD:
      return 'RH';
    case TALLAGE_CARRIAGE:
      return 'TAL';
    case TRAP_CARRIAGE:
      return 'TRA';
    case TRIBUTE_CARRIAGE:
      return 'TRI';
    default:
      return '';
  }
};

const tplForce = ({
  id,
  type,
  subtype,
  hidden,
}: {
  id?: string;
  subtype?: string;
  type: string;
  hidden: boolean;
}) => `
  <div ${id ? `id="${id}"` : ''} data-type="${type}" data-hidden="${
  hidden ? 'true' : 'false'
}" ${subtype ? `data-subtype="${subtype}" ` : ''}class="gest_force">${
  type !== HENCHMEN && !hidden ? `<span>${getRevealedText(type)}</span>` : ''
}
${type === ROBIN_HOOD && hidden ? `<span>*</span>` : ''}
${subtype && !hidden ? `<span>${getRevealedText(subtype)}</span>` : ''}
${subtype && hidden ? `<span>*${getRevealedText(subtype)}</span>` : ''}
</div>`;

const tplMarkerSpace = ({
  id,
  top,
  left,
  extraClasses,
}: {
  id: string;
  top: number;
  left: number;
  extraClasses?: string;
}) => {
  return `<div id="${id}" class="${
    extraClasses ? ` ${extraClasses}` : ''
  }" style="top: calc(var(--gestMapScale) * ${top}px); left: calc(var(--gestMapScale) * ${left}px);"></div>`;
};

const tplTrack = ({ config }: { config: TrackConfig[] }) =>
  config
    .map((markerSpace) =>
      tplMarkerSpace({
        id: `${markerSpace.id}`,
        top: markerSpace.top,
        left: markerSpace.left,
        extraClasses: markerSpace.extraClasses,
      })
    )
    .join('');

const tplMarker = ({
  id,
  extraClasses,
}: {
  id: string;
  extraClasses?: string;
}) => `<div id="${id}"${extraClasses ? ` class="${extraClasses}"` : ''}></div>`;

const tplSpaces = () =>
  Object.entries(SPACES_CONFIG)
    .map(([spaceId, config]) => {
      let html = '';
      if (config.camps) {
        html += `<div id="camp_${spaceId}" class="gest_forces" style="top: calc(var(--gestMapScale) * ${config.camps.top}px); left: calc(var(--gestMapScale) * ${config.camps.left}px); width: calc(var(--gestMapScale) * ${config.camps.width}px); height: calc(var(--gestMapScale) * ${config.camps.height}px);"></div>`;
      }
      if (config.henchmen) {
        html += `<div id="henchmen_${spaceId}" class="gest_forces" style="top: calc(var(--gestMapScale) * ${config.henchmen.top}px); left: calc(var(--gestMapScale) * ${config.henchmen.left}px); width: calc(var(--gestMapScale) * ${config.henchmen.width}px); height: calc(var(--gestMapScale) * ${config.henchmen.height}px);"></div>`;
      }
      if (config.merryMen) {
        html += `<div id="merryMen_${spaceId}" class="gest_forces" style="top: calc(var(--gestMapScale) * ${config.merryMen.top}px); left: calc(var(--gestMapScale) * ${config.merryMen.left}px); width: calc(var(--gestMapScale) * ${config.merryMen.width}px); height: calc(var(--gestMapScale) * ${config.merryMen.height}px);"></div>`;
      }
      if (config.carriages) {
        html += `<div id="carriage_${spaceId}" class="gest_forces" style="top: calc(var(--gestMapScale) * ${config.carriages.top}px); left: calc(var(--gestMapScale) * ${config.carriages.left}px); width: calc(var(--gestMapScale) * ${config.carriages.width}px); height: calc(var(--gestMapScale) * ${config.carriages.height}px);"></div>`;
      }
      return html;
    })
    .join('');

const tplGameMap = ({
  gamedatas,
}: {
  gamedatas: AGestOfRobinHoodGamedatas;
}) => {
  return `
  <div id="gest_game_map">
    ${tplTrack({ config: JUSTICE_TRACK_CONFIG })}
    ${tplTrack({ config: ORDER_TRACK })}
    ${tplTrack({ config: PARISH_STATUS_BOXES })}
    ${tplTrack({ config: ROYAL_INSPECTION_TRACK })}
    ${tplTrack({ config: INITIATIVE_TRACK })}
    ${tplTrack({ config: UNIQUE_SPACES })}
    ${tplSpaces()}
  </div>`;
};
