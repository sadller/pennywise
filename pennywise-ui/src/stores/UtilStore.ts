import { observable, action, makeObservable } from 'mobx';

class UtilStore {
  categories: string[] = [];
  paymentModes: string[] = [];

  constructor() {
    makeObservable(this, {
      categories: observable,
      paymentModes: observable,
      setAppConstants: action,
    });
  }

  setAppConstants(data: { categories: string[]; paymentModes: string[] }) {
    this.categories = data.categories;
    this.paymentModes = data.paymentModes;
  }
}

export const utilStore = new UtilStore();
