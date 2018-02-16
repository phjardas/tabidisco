import { injectable, inject, multiInject } from 'inversify';

import { Bus, BusSymbol, EffectFactory } from './bus';
import { EffectsSymbol } from './effects';
import { Player, PlayerSymbol } from './player';

export interface Tabidisco {
  readonly bus: Bus;
}

export const TabidiscoSymbol = Symbol.for('Tabidisco');

@injectable()
export class TabidiscoImpl implements Tabidisco {
  constructor(
    @inject(BusSymbol) public readonly bus: Bus,
    @inject(PlayerSymbol) player: Player,
    @multiInject(EffectsSymbol) effectFactories: EffectFactory[]
  ) {
    // attach effects
    const effects = effectFactories.map(e => e.getEffects()).reduce((a, b) => [...a, ...b], []);
    effects.forEach(effect => bus.effect(effect));

    // attach event emitters
    [player].forEach(bus.attach.bind(bus));
  }
}
