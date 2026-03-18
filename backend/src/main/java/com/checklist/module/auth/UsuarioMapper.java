package com.checklist.module.auth;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "supervisorId", source = "supervisor.id")
    @Mapping(target = "storeId", source = "store.id")
    @Mapping(target = "storeCode", source = "store.code")
    @Mapping(target = "storeName", source = "store.name")
    UserSummaryDTO toDTO(UserAccount user);
}
