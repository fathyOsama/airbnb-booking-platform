import { Component, effect, EventEmitter, inject, input, OnDestroy, Output } from '@angular/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FormsModule } from '@angular/forms';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import L, { tileLayer, latLng } from 'leaflet';
import { ToastService } from '../../../../../layout/toast.service';
import { Country } from '../model/country.model';
import { CountryService } from '../service-location/country.service';

@Component({
  selector: 'app-location-map',
  imports: [LeafletModule, FormsModule, AutoCompleteModule],
  templateUrl: './location-map.component.html',
  styleUrl: './location-map.component.scss'
})
export class LocationMapComponent implements OnDestroy {

  countryService = inject(CountryService);
  toastService = inject(ToastService);

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private resizeObserver: ResizeObserver | undefined;
  private resizeTimeout: ReturnType<typeof setTimeout> | undefined;
  private mapDestroyed = false;

  private markerIcon = L.icon({
    iconUrl: '/leaflet/marker-icon.png',
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    shadowUrl: '/leaflet/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  location = input.required<string>();
  placeholder = input<string>("Select your home country");

  currentLocation: Country | undefined;

  @Output()
  locationChange = new EventEmitter<string>();

  // Fixed map: every interaction is disabled
  options: L.MapOptions = {
    layers: [
      tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
      }),
    ],
    zoom: 2,
    center: latLng(20, 0),
    zoomControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    touchZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomSnap: 1
  };

  countries: Array<Country> = [];
  filteredCountries: Array<Country> = [];

  constructor() {
    this.listenToLocation();
  }

  onMapReady(map: L.Map) {
    this.map = map;

    // re-measure after the dialog animation, then place the pin
    this.resizeTimeout = setTimeout(() => {
      this.safeInvalidate();
      this.placePin(this.currentLocation);
    }, 300);

    this.resizeObserver = new ResizeObserver(() => this.safeInvalidate());
    this.resizeObserver.observe(map.getContainer());

    this.changeMapLocation(this.location());
  }

  private safeInvalidate(): void {
    if (this.mapDestroyed || !this.map) return;
    try {
      this.map.invalidateSize();
    } catch {
      // map was removed while a resize was pending
    }
  }

  ngOnDestroy(): void {
    this.mapDestroyed = true;
    clearTimeout(this.resizeTimeout);
    this.resizeObserver?.disconnect();
    this.marker?.remove();
    this.map = undefined;
  }

  onLocationChange(event: AutoCompleteSelectEvent) {
    const country = event.value as Country;
    this.locationChange.emit(country.cca3);
    this.changeMapLocation(country.cca3);
  }

  private listenToLocation() {
    effect(() => {
      const countriesState = this.countryService.countries();
      if (countriesState.status === "OK" && countriesState.value) {
        this.countries = countriesState.value;
        this.filteredCountries = countriesState.value;
        this.changeMapLocation(this.location());
      } else if (countriesState.status === "ERROR") {
        this.toastService.send({
          severity: "error", summary: "Error",
          detail: "Something went wrong when loading countries on change location"
        });
      }
    });
  }

  private changeMapLocation(code: string) {
    this.currentLocation = this.countries.find(country => country.cca3 === code);
    this.placePin(this.currentLocation);
  }

  private placePin(country: Country | undefined) {
    if (!country || !this.map || this.mapDestroyed || !country.latlng) return;

    const [lat, lng] = country.latlng;
    this.map.setView([lat, lng], this.zoomFor(country.area), { animate: false });

    this.marker?.remove();
    this.marker = L.marker([lat, lng], { icon: this.markerIcon, interactive: false })
      .addTo(this.map)
      .bindTooltip(country.name.common, { permanent: true, direction: 'top', offset: [0, -34] });
  }

  // bigger countries need a smaller zoom so they fit in the box
  private zoomFor(area: number): number {
    if (area > 5_000_000) return 3;
    if (area > 1_000_000) return 4;
    if (area > 200_000) return 5;
    if (area > 50_000) return 6;
    return 7;
  }

  search(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase();
    this.filteredCountries =
      this.countries.filter(country => country.name.common.toLowerCase().startsWith(query));
  }
}
