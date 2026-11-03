import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoryService } from './service/category.service';
import { filter, map } from 'rxjs';
import { Category, CategoryName } from './model/category.model';

@Component({
  selector: 'app-category',
  imports: [
    FontAwesomeModule
  ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent {

  categoryService : CategoryService = inject(CategoryService);

  categories : Category[] | undefined;

  currentActivateCategory : Category = this.categoryService.getCategoryByDefault();

  isHome = false;
  router = inject(Router);
  ActivatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.listenRouter();
    this.currentActivateCategory.activated = false;
    this.fetchCategories();
  }

  private fetchCategories() : void {
    this.categories = this.categoryService.getCategories();
  }

  scrollRow(el: HTMLElement, amount: number): void {
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  private listenRouter() {
    this.router.events.pipe(
      filter((evt): evt is NavigationEnd => evt instanceof NavigationEnd)
    )
      .subscribe({
        next: (evt: NavigationEnd) => {
          this.isHome = evt.url.split("?")[0] === "/";
          if (this.isHome && evt.url.indexOf("?") === -1) {
            const categoryByTechnicalName = this.categoryService.getCategoryByTechnicalName("ALL");
            this.categoryService.changeCategory(categoryByTechnicalName!);
          }
        },
      });

    this.ActivatedRoute.queryParams
      .pipe(
        map(params => params["category"])
      )
      .subscribe({
        next: (categoryName: CategoryName) => {
          const category = this.categoryService.getCategoryByTechnicalName(categoryName);
          if (category) {
            this.activateCategory(category);
            this.categoryService.changeCategory(category);
          }
        }
      })
  }

  private activateCategory(category: Category) {
    this.currentActivateCategory.activated = false;
    this.currentActivateCategory = category;
    this.currentActivateCategory.activated = true;
  }

  onChangeCategory(category: Category) {
    this.activateCategory(category);
    this.router.navigate([], {
      queryParams: {"category": category.technicalName},
      relativeTo: this.ActivatedRoute
    })
  }
}
