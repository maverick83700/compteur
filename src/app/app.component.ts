import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CounterService } from './services/counter.service';
import { Counter, CounterGroup } from './models/counter.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  protected counterService = inject(CounterService);
  groups = this.counterService.groups;

  // État du menu burger
  isMenuOpen = false;
  
  selectedGroupId = signal<string | null>(null); // Signal pour le groupe actif

  // Getter pour récupérer le groupe sélectionné
  selectedGroup = computed(() => 
    this.groups().find(g => g.id === this.selectedGroupId()) || null
  );

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  selectGroup(id: string) {
    this.selectedGroupId.set(id);
    // Optionnel : fermer le menu sur mobile après sélection
    if (window.innerWidth < 768) this.isMenuOpen = false;
  }

  deleteGroup(id: string, event: Event) {
    event.stopPropagation(); // Évite de sélectionner le groupe en le supprimant
    if (confirm('Supprimer ce groupe ?')) {
      this.counterService.groups.update(gs => gs.filter(g => g.id !== id));
      if (this.selectedGroupId() === id) this.selectedGroupId.set(null);
    }
  }

  onDuplicateGroup(event: Event, group: CounterGroup) {
    event.stopPropagation();
    this.counterService.duplicateGroup(group);
  }

  onDuplicateCounter(event: Event, groupId: string, counter: Counter) {
    event.stopPropagation();
    this.counterService.duplicateCounter(groupId, counter);
  }

  // Helper pour le HTML afin de bloquer le début du drag sur mobile
  /*stopProp(event: Event) {
    event.stopPropagation();
  }*/

  // On ferme le menu après une action
  handleImport(event: Event) {
    this.onFileSelected(event);
    this.isMenuOpen = false;
  }

  dropGroup(event: CdkDragDrop<CounterGroup[]>) {
    const newOrder = [...this.groups()];
    moveItemInArray(newOrder, event.previousIndex, event.currentIndex);
    this.counterService.groups.set(newOrder);
  }

  dropCounter(event: CdkDragDrop<Counter[]>, group: CounterGroup) {
    moveItemInArray(group.counters, event.previousIndex, event.currentIndex);
    this.counterService.groups.set([...this.groups()]);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (e) => this.counterService.importJson(e.target?.result as string);
      reader.readAsText(input.files[0]);
    }
  }
}