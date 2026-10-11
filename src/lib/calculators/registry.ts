import { CalculatorCategory, CalculatorEngine } from "./types";

/**
 * FinCalc India — Central Calculator Registry
 *
 * Provides a scalable registry for 100–300+ calculators across all categories.
 * Decoupled from heavy UI modules to allow server-side SSG and client-side usage.
 */
class CalculatorRegistry {
  private calculators = new Map<string, CalculatorEngine<any, any>>();

  public register<TInput extends Record<string, any>, TResult>(
    engine: CalculatorEngine<TInput, TResult>
  ): void {
    if (this.calculators.has(engine.id)) {
      console.warn(`[CalculatorRegistry] Warning: Overwriting existing calculator with ID "${engine.id}"`);
    }
    this.calculators.set(engine.id, engine);
  }

  public get(id: string): CalculatorEngine<any, any> | undefined {
    return this.calculators.get(id);
  }

  public has(id: string): boolean {
    return this.calculators.has(id);
  }

  public getAll(): CalculatorEngine<any, any>[] {
    return Array.from(this.calculators.values());
  }

  public getByCategory(category: CalculatorCategory): CalculatorEngine<any, any>[] {
    return this.getAll().filter((calc) => calc.metadata.category === category);
  }

  public count(): number {
    return this.calculators.size;
  }
}

export const registry = new CalculatorRegistry();

export function registerCalculator<TInput extends Record<string, any>, TResult>(
  engine: CalculatorEngine<TInput, TResult>
): void {
  registry.register(engine);
}

export function getCalculatorById(id: string): CalculatorEngine<any, any> | undefined {
  return registry.get(id);
}

export function getCalculatorsByCategory(category: CalculatorCategory): CalculatorEngine<any, any>[] {
  return registry.getByCategory(category);
}

export function getAllCalculators(): CalculatorEngine<any, any>[] {
  return registry.getAll();
}

export function getCalculatorsCount(): number {
  return registry.count();
}
