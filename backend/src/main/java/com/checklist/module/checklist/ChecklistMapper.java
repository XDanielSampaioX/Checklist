package com.checklist.module.checklist;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChecklistMapper {

    @Mapping(target = "status", expression = "java(checklist.getStatus())")
    @Mapping(target = "overdue", expression = "java(checklist.getStatus() == ChecklistStatus.OVERDUE)")
    @Mapping(target = "itemCount", expression = "java(checklist.getItems() != null ? checklist.getItems().size() : 0)")
    @Mapping(target = "assignedToUserId", source = "assignedTo.id")
    @Mapping(target = "assignedToUserName", source = "assignedTo.name")
    @Mapping(target = "createdByUserId", source = "createdBy.id")
    @Mapping(target = "createdByUserName", source = "createdBy.name")
    @Mapping(target = "storeId", source = "store.id")
    @Mapping(target = "storeCode", source = "store.code")
    @Mapping(target = "storeName", source = "store.name")
    ChecklistDTO toDTO(Checklist checklist);
}
