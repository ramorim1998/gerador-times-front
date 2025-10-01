import { Component, OnInit, inject } from '@angular/core';
import { 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardContent,
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonCheckbox,
  IonButton,
  IonIcon,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonFooter,
  AlertController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // ← Importar
import { addIcons } from 'ionicons';
import { add, personAdd, closeCircle, createOutline, trashOutline, peopleOutline } from 'ionicons/icons';
import { GroupService } from '../services/group.service'; // ← Importar serviço

interface GroupMember {
  name: string;
  active: boolean;
}

interface Group {
  _id?: string;
  name: string;
  members: GroupMember[];
  userId: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule, // ← Adicionar aqui
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonListHeader,
    IonSelect,
    IonSelectOption,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonFooter
  ]
})
export class HomePage implements OnInit {
  private groupService = inject(GroupService); // ← Injetar serviço
  private alertController = inject(AlertController);

  currentTab: string = 'groups';
  groups: Group[] = [];
  currentGroup: Group = { name: '', members: [], userId: 'user-123' }; // ← Add userId
  currentGroupIndex: number = -1;
  teamsCount: number = 2;
  selectedGroupIndex: number = -1;
  selectedGroup: Group | null = null;
  generatedTeams: string[][] = [];

  constructor() {
    addIcons({ 
      add, 
      personAdd, 
      closeCircle, 
      createOutline, 
      trashOutline, 
      peopleOutline 
    });
  }

  ngOnInit() {
    this.loadGroups();
  }

  // Métodos atualizados para usar o serviço
  async loadGroups() {
    try {
      this.groups = await this.groupService.getGroups('user-123').toPromise() || [];
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      // Fallback para localStorage se backend não estiver disponível
      const savedGroups = localStorage.getItem('teamGroups');
      if (savedGroups) {
        this.groups = JSON.parse(savedGroups);
      }
    }
  }

  async saveGroups() {
    try {
      // Tenta salvar no backend primeiro
      if (this.currentGroup._id) {
        await this.groupService.updateGroup(this.currentGroup._id, this.currentGroup).toPromise();
      } else {
        const newGroup = await this.groupService.createGroup(this.currentGroup).toPromise();
        if (newGroup) this.currentGroup = newGroup;
      }
    } catch (error) {
      console.error('Erro ao salvar no backend, usando localStorage:', error);
      // Fallback para localStorage
      localStorage.setItem('teamGroups', JSON.stringify(this.groups));
    }
  }

  async deleteGroup(index: number) {
    const group = this.groups[index];
    const alert = await this.alertController.create({
      header: 'Excluir Grupo',
      message: 'Tem certeza que deseja excluir este grupo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            try {
              if (group._id) {
                await this.groupService.deleteGroup(group._id).toPromise();
              }
              this.groups.splice(index, 1);
              localStorage.setItem('teamGroups', JSON.stringify(this.groups));
            } catch (error) {
              console.error('Erro ao excluir grupo:', error);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // ... o resto dos métodos permanece igual
  onTabChange(event: any) {
    this.currentTab = event.detail.value;
    if (this.currentTab === 'generate-teams') {
      this.updateAvailableMembers();
    }
  }

  newGroup() {
    this.currentGroup = {
      name: 'Novo Grupo',
      members: [],
      userId: 'user-123'
    };
    this.currentGroupIndex = -1;
    this.currentTab = 'edit-group';
  }

  editGroup(index: number) {
    this.currentGroup = JSON.parse(JSON.stringify(this.groups[index]));
    this.currentGroupIndex = index;
    this.currentTab = 'edit-group';
  }

  addMember() {
    this.currentGroup.members.push({
      name: '',
      active: true
    });
  }

  removeMember(index: number) {
    this.currentGroup.members.splice(index, 1);
  }

  async saveGroup() {
    if (!this.currentGroup.name.trim()) {
      this.showAlert('Erro', 'Por favor, insira um nome para o grupo.');
      return;
    }

    this.currentGroup.members = this.currentGroup.members.filter(member => 
      member.name.trim() !== ''
    );

    if (this.currentGroup.members.length === 0) {
      this.showAlert('Erro', 'O grupo deve ter pelo menos um membro.');
      return;
    }

    if (this.currentGroupIndex === -1) {
      this.groups.push(this.currentGroup);
    } else {
      this.groups[this.currentGroupIndex] = this.currentGroup;
    }

    await this.saveGroups();
    this.cancelEdit();
  }

  cancelEdit() {
    this.currentTab = 'groups';
    this.currentGroupIndex = -1;
  }

  updateAvailableMembers() {
    if (this.groups.length > 0) {
      this.selectedGroupIndex = 0;
      this.onGroupSelectChange();
    } else {
      this.selectedGroup = null;
    }
  }

  onGroupSelectChange() {
    if (this.selectedGroupIndex >= 0 && this.selectedGroupIndex < this.groups.length) {
      this.selectedGroup = JSON.parse(JSON.stringify(this.groups[this.selectedGroupIndex]));
    } else {
      this.selectedGroup = null;
    }
  }

  generateTeams() {
    if (!this.selectedGroup) {
      this.showAlert('Erro', 'Selecione um grupo primeiro.');
      return;
    }

    const activeMembers = this.selectedGroup.members
      .filter(member => member.active && member.name.trim() !== '')
      .map(member => member.name);

    if (activeMembers.length === 0) {
      this.showAlert('Erro', 'Selecione pelo menos um membro para jogar.');
      return;
    }

    if (this.teamsCount > activeMembers.length) {
      this.showAlert('Erro', 
        `Número de times (${this.teamsCount}) não pode ser maior que o número de jogadores (${activeMembers.length}).`);
      return;
    }

    const shuffledMembers = [...activeMembers].sort(() => Math.random() - 0.5);
    this.generatedTeams = Array.from({ length: this.teamsCount }, () => []);
    
    shuffledMembers.forEach((member, index) => {
      this.generatedTeams[index % this.teamsCount].push(member);
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}