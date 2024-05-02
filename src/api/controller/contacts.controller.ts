import { Body, Controller, Delete, Get, Logger, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FactoryService } from "../../common/service/factory.service";
import { UserService } from "../service/user.service";
import { getSuccessResponse, ServiceResponse } from "../../common/common.types";
import { AccountService } from "../service/account.service";
import { AuthGuard } from "./util/auth.guard";
import { CreateContactDto, SearchUsersDto, UserSearchResponse } from "../dto/dto.types";

@Controller("api/chain/contacts")
@ApiTags("action")
export class ContactsController {
  private readonly logger = new Logger(ContactsController.name);

  constructor(private readonly accountService: AccountService,
              private readonly userService: UserService,
              private readonly factoryService: FactoryService) {
  }

  // todo: search for contacts

  @Get("/")
  @UseGuards(AuthGuard)
  async getContacts(@Req() req) {
    const user = req.user;
    const contacts = await this.userService.getContacts(user.id);
    return getSuccessResponse({
      contacts
    });
  }

  @Delete("/contact/:contactId")
  @UseGuards(AuthGuard)
  async removeContact(@Param("contactId") contactId: number, @Req() req) {
    const user = req.user;
    const contacts = await this.userService.removeContact(user.id, contactId);
    return getSuccessResponse({
      contacts
    });
  }

  @Put("/contact/:contactId")
  @UseGuards(AuthGuard)
  async updateContact(@Param("contactId") contactId: number, @Req() req, @Body() contactInfo: CreateContactDto) {
    const user = req.user;
    const contacts = await this.userService.updateContact(user.id, contactId, contactInfo);
    return getSuccessResponse({
      contacts
    });
  }

  @Post("/contact")
  @UseGuards(AuthGuard)
  async addContact(@Body() contactInfo: CreateContactDto, @Req() req) {
      const user = req.user;
      const contacts = await this.userService.addContact(user.id, contactInfo);
      return getSuccessResponse({
        contacts
      });
  }

  @Post("/search")
  @UseGuards(AuthGuard)
  async searchUsers(@Body() searchUsersDto: SearchUsersDto, @Req() req): Promise<ServiceResponse<UserSearchResponse>> {
      const user = req.user;
      const searchResponse = await this.userService.searchUsers(user.id, searchUsersDto.query);
      return getSuccessResponse(searchResponse);
  }

}
