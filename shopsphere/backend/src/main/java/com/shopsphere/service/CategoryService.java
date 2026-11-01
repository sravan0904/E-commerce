package com.shopsphere.service;

import com.shopsphere.dto.CategoryDto;
import com.shopsphere.entity.Category;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getActiveCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDto(category);
    }

    public CategoryDto getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return mapToDto(category);
    }

    @Transactional
    public CategoryDto createCategory(CategoryDto dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BadRequestException("Category with name " + dto.getName() + " already exists");
        }

        String slug = dto.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = dto.getName().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\s-]", "").replaceAll("\\s+", "-");
        }

        Category category = new Category();
        category.setName(dto.getName());
        category.setSlug(slug);
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setActive(dto.isActive());
        category.setDisplayOrder(dto.getDisplayOrder());

        Category saved = categoryRepository.save(category);
        return mapToDto(saved);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setImageUrl(dto.getImageUrl());
        category.setActive(dto.isActive());
        category.setDisplayOrder(dto.getDisplayOrder());

        Category updated = categoryRepository.save(category);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDto mapToDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setImageUrl(category.getImageUrl());
        dto.setActive(category.isActive());
        dto.setDisplayOrder(category.getDisplayOrder());
        return dto;
    }
}
