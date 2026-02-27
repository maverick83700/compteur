import { Injectable, signal } from '@angular/core';
import { Counter, CounterGroup } from '../models/counter.model';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

@Injectable({ providedIn: 'root' })
export class CounterService {
  private fileName = 'counters_data.json';
  // Signal réactif contenant la liste des groupes
  groups = signal<CounterGroup[]>([]);

  constructor() {
    this.loadData();
  }

  // SAUVEGARDE PHYSIQUE
  async saveToDevice() {
    try {
      await Filesystem.writeFile({
        path: this.fileName,
        data: JSON.stringify(this.groups()),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log('Données sauvegardées sur le système de fichiers');
    } catch (e) {
      console.error('Erreur de sauvegarde', e);
    }
  }

  // CHARGEMENT PHYSIQUE
  async loadData() {
    try {
      const contents = await Filesystem.readFile({
        path: this.fileName,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      if (contents.data) {
        this.groups.set(JSON.parse(contents.data as string));
      }
    } catch (e) {
      console.log('Aucun fichier trouvé, initialisation vide');
      this.groups.set([]);
    }
  }

  // Générateur robuste sans dépendance à 'crypto'
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  addGroup(name: string = 'Nouveau Groupe') {
    const newGroup: CounterGroup = { 
      id: this.generateId(), // On utilise notre helper ici
      name, 
      counters: [] 
    };
    this.groups.update(prev => [...prev, newGroup]);
    this.saveToDevice();
  }

  addCounter(groupId: string) {
    this.groups.update(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          counters: [...g.counters, { id: this.generateId(), title: 'Compteur', value: 0 }]
        };
      }
      return g;
    }));
    this.saveToDevice();
  }

  duplicateGroup(group: CounterGroup) {
    const clone: CounterGroup = JSON.parse(JSON.stringify(group));
    clone.id = this.generateId();
    clone.name += " (Copie)";
    clone.counters.forEach(c => c.id = this.generateId());
    this.groups.update(prev => [...prev, clone]);
    this.saveToDevice();
  }

  duplicateCounter(groupId: string, counter: Counter) {
    this.groups.update(prev => prev.map(g => {
      if (g.id === groupId) {
        const newCounter = { ...counter, id: this.generateId(), title: counter.title + ' (Copie)' };
        return { ...g, counters: [...g.counters, newCounter] };
      }
      return g;
    }));
    this.saveToDevice();
  }

  importJson(jsonString: string) {
    try {
      const imported: CounterGroup[] = JSON.parse(jsonString);
      // On régénère les IDs pour éviter les conflits et on ajoute à la suite
      const cleaned = imported.map(g => ({
        ...g,
        id: this.generateId(),
        counters: g.counters.map(c => ({ ...c, id: this.generateId() }))
      }));
      this.groups.update(prev => [...prev, ...cleaned]);
      this.saveToDevice();
    } catch (e) {
      alert("Fichier JSON invalide");
    }
  }

  exportJson() {
    const data = JSON.stringify(this.groups(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export_compteurs.json';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}