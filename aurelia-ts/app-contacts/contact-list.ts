import {inject} from '../framework/index'
import {EventAggregator} from '../event-aggregator/index';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed} from './messages';

@inject(WebAPI, EventAggregator)
export class ContactList {
  public api;
  public contacts;
  public selectedId;
  constructor(api, ea){
    this.api = api;
    this.contacts = [];

    ea.subscribe(ContactViewed, msg => this.select(msg.contact));
    ea.subscribe(ContactUpdated, msg => {
      let id = msg.contact.id;
      let found = this.contacts.filter(x => x.id == id)[0];
      (<any>Object).assign(found, msg.contact);
    });
  }

  created(){
    this.api.getContactList().then(contacts => {
      this.contacts = contacts;
    });
  }

  select(contact){
    this.selectedId = contact.id;
    return true;
  }
}
