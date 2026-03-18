package com.checklist.module.item;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(target = "checklistId", source = "checklist.id")
    ItemDTO toDTO(Item item);

    ItemAttachmentDTO toAttachmentDTO(ItemAttachment attachment);
}
