const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const debug = isDebug ? console.info.bind(window.console) : () => {};

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const lowerCaseFirstLetter = (string: string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

const createForcesLog = (forces: GestForce[]) => {
  let log = '';
  const args = {};
  forces.forEach((force, index) => {
    const key = `tkn_force_${index}`;
    log = log + '${' + key + '}';
    args[key] = `${force.hidden ? HIDDEN : REVEALED}:${force.type}`
  });

  return {
    log,
    args
  }
}